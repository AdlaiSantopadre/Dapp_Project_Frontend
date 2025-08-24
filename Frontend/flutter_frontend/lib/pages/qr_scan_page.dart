import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:http/http.dart' as http;

/// Dati possibile payload QR.
class DocumentQrData {
  final String cid;
  final String? tx;
  final String? sig;
  final String? alg;
  final String? kid;
  final int? ts;

  DocumentQrData({
    required this.cid,
    this.tx,
    this.sig,
    this.alg,
    this.kid,
    this.ts,
  });
}

class QrScanPage extends StatefulWidget {
  final String backendBaseUrl; // es. https://api.tuodominio.tld
  final String jwt;            // token utente già ottenuto al login

  const QrScanPage({
    super.key,
    required this.backendBaseUrl,
    required this.jwt,
  });

  @override
  State<QrScanPage> createState() => _QrScanPageState();
}

class _QrScanPageState extends State<QrScanPage> {
  final MobileScannerController _controller = MobileScannerController();
  bool _isProcessing = false;
  String? _status;
  Map<String, dynamic>? _docMeta;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _setStatus(String msg) => setState(() => _status = msg);

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;
    final raw = capture.barcodes.first.rawValue;
    if (raw == null || raw.isEmpty) return;

    setState(() => _isProcessing = true);
    _setStatus('QR letto, parsing in corso...');

    try {
      final data = _parseQrPayload(raw);

      // Validazione CID (check semplice base32 v1 - prefisso "bafy")
      if (!_looksLikeCidV1Base32(data.cid)) {
        throw Exception('CID non valido: ${data.cid}');
      }

      // (Opzionale) verifica firma lato backend
      if (data.sig != null) {
        final ok = await _verifySignature(data);
        if (!ok) throw Exception('Firma QR non valida.');
      }

      _setStatus('CID valido. Risoluzione documento...');
      final meta = await _resolveCid(data.cid);

      setState(() {
        _docMeta = meta;
        _status = 'Documento risolto';
      });
    } catch (e) {
      _setStatus('Errore: $e');
    } finally {
      // per permettere una nuova scansione, puoi rimettere a false dopo un delay
      await Future.delayed(const Duration(milliseconds: 800));
      setState(() => _isProcessing = false);
    }
  }

  /// Parsing: accetta sia "dr:v1?cid=..." sia JSON con { "cid": ... }
  DocumentQrData _parseQrPayload(String raw) {
    // JSON?
    try {
      final obj = jsonDecode(raw);
      if (obj is Map<String, dynamic> && obj['cid'] is String) {
        return DocumentQrData(
          cid: obj['cid'] as String,
          tx: obj['tx'] as String?,
          sig: obj['sig'] as String?,
          alg: obj['alg'] as String?,
          kid: obj['kid'] as String?,
          ts: (obj['ts'] is int) ? obj['ts'] as int : null,
        );
      }
    } catch (_) {
      // non JSON: ignora
    }

    // URI custom scheme: dr:v1?cid=...&tx=...&sig=...
    Uri? uri;
    try {
      uri = Uri.parse(raw);
    } catch (_) {}

    if (uri != null && (uri.scheme == 'dr' || uri.scheme.isEmpty)) {
      final qp = uri.queryParameters;
      final cid = qp['cid'];
      if (cid == null || cid.isEmpty) {
        throw Exception('QR privo di cid');
      }
      return DocumentQrData(
        cid: cid,
        tx: qp['tx'],
        sig: qp['sig'],
        alg: qp['alg'],
        kid: qp['kid'],
        ts: qp['ts'] != null ? int.tryParse(qp['ts']!) : null,
      );
    }

    // Fallback: forse il raw è direttamente il CID
    if (_looksLikeCidV1Base32(raw)) {
      return DocumentQrData(cid: raw);
    }

    throw Exception('Formato QR non riconosciuto');
  }

  bool _looksLikeCidV1Base32(String cid) {
    // Check pragmatico: CIDv1 base32 => minuscole, inizia spesso con "bafy"
    // (per robustezza reale usa una lib CID; qui facciamo solo uno screening rapido)
    final c = cid.trim();
    final regex = RegExp(r'^[a-z2-7]+$'); // set base32 lower-case
    return c.length >= 20 && c.startsWith('bafy') && regex.hasMatch(c);
  }

  Future<bool> _verifySignature(DocumentQrData d) async {
    final url = Uri.parse('${widget.backendBaseUrl}/qr/verify');
    final body = {
      'cid': d.cid,
      if (d.tx != null) 'tx': d.tx,
      if (d.ts != null) 'ts': d.ts,
      if (d.alg != null) 'alg': d.alg,
      if (d.kid != null) 'kid': d.kid,
      if (d.sig != null) 'sig': d.sig,
    };

    final resp = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${widget.jwt}',
      },
      body: jsonEncode(body),
    );

    if (resp.statusCode != 200) return false;
    final json = jsonDecode(resp.body);
    return json['ok'] == true;
  }

  Future<Map<String, dynamic>> _resolveCid(String cid) async {
    final url = Uri.parse('${widget.backendBaseUrl}/documents/resolve?cid=$cid');
    final resp = await http.get(
      url,
      headers: {'Authorization': 'Bearer ${widget.jwt}'},
    );

    if (resp.statusCode == 403) {
      throw Exception('Accesso negato: ruolo non autorizzato');
    }
    if (resp.statusCode != 200) {
      throw Exception('Risoluzione fallita (${resp.statusCode})');
    }
    return jsonDecode(resp.body) as Map<String, dynamic>;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scansione QR documento')),
      body: Column(
        children: [
          Expanded(
            child: MobileScanner(
              controller: _controller,
              onDetect: _onDetect,
            ),
          ),
          if (_status != null)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Text(_status!, style: const TextStyle(fontSize: 14)),
            ),
          if (_docMeta != null)
            Padding(
              padding: const EdgeInsets.all(12),
              child: _DocMetaCard(meta: _docMeta!),
            ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}

class _DocMetaCard extends StatelessWidget {
  final Map<String, dynamic> meta;
  const _DocMetaCard({required this.meta});

  @override
  Widget build(BuildContext context) {
    final cid = meta['cid'] ?? '';
    final name = meta['name'] ?? 'Documento';
    final size = meta['size']?.toString() ?? 'N/D';
    final tx = meta['txHash'] ?? 'N/D';

    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(name, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text('CID: $cid'),
            Text('Tx: $tx'),
            Text('Dimensione: $size bytes'),
            const SizedBox(height: 12),
            Row(
              children: [
                ElevatedButton(
                  onPressed: () {
                    // TODO: apri il PDF con url firmato (meta['signedUrl'])
                    // Navigator.push(...);
                  },
                  child: const Text('Apri documento'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
