import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';

class QrScanPage extends StatefulWidget {
  final String backendBaseUrl; // es. https://api.tuodominio.tld
  final String jwt; // token utente già ottenuto al login

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
  String? _pdfUrl;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _setStatus(String msg) {
    if (!mounted) return;
    setState(() => _status = msg);
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;
    final raw = capture.barcodes.first.rawValue;
    if (raw == null || raw.isEmpty) return;

    setState(() => _isProcessing = true);
    _setStatus('QR letto, parsing in corso...');

    try {
      // Qui il QR contiene direttamente la URL completa
      if (!raw.startsWith("http")) {
        throw Exception("Il QR non contiene una URL valida");
      }

      final uri = Uri.tryParse(raw);
      if (uri == null || !uri.host.contains("ipfs.w3s.link")) {
        throw Exception("URL QR non valida o non è una risorsa Storacha");
      }

      // Salviamo direttamente l'URL da aprire
      if (!mounted) return;
      setState(() {
        _pdfUrl = raw;
        _status = 'Documento pronto';
      });
    } catch (e) {
      _setStatus('Errore: $e');
    } finally {
      await Future.delayed(const Duration(milliseconds: 500));
      if (!mounted) return;
      setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scansione QR documento')),
      body: Column(
        children: [
          // Scanner fino a quando non ho trovato un PDF URL
          if (_pdfUrl == null)
            Expanded(
              child: MobileScanner(
                controller: _controller,
                onDetect: _onDetect,
              ),
            )
          else
            // Mostro il PDF
            // Mostra direttamente il PDF in viewer
            Expanded(child: SfPdfViewer.network(_pdfUrl!)),
          if (_status != null)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Text(_status!, style: const TextStyle(fontSize: 14)),
            ),
          if (_pdfUrl != null)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  ElevatedButton.icon(
                    icon: const Icon(Icons.qr_code_scanner),
                    label: const Text("Nuovo QR"),
                    onPressed: () {
                      setState(() {
                        _pdfUrl = null;
                        _status = "Scanner riavviato";
                      });
                    },
                  ),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.exit_to_app),
                    label: const Text("Chiudi"),
                  onPressed: () {
                    Navigator.of(context).pop();
                    Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
                  }),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
