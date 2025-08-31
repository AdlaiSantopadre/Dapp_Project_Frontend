import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/archivio_documenti_service.dart';
import '../state/auth_state.dart';
import '../config.dart';
import 'qr_scan_page.dart';   // importa la tua QrScanPage

class DocumentsPage extends StatefulWidget {
  const DocumentsPage({super.key});

  @override
  State<DocumentsPage> createState() => _DocumentsPageState();
}

class _DocumentsPageState extends State<DocumentsPage> {
  final _service = ArchivioDocumentiService();
  List<Map<String, dynamic>> _allDocs = [];
  String? _selectedImpianto;

  @override
  void initState() {
    super.initState();
    _loadDocuments();
  }

  Future<void> _loadDocuments() async {
    final docs = await _service.listAll();
    setState(() {
      _allDocs = docs;
    });
  }

  /// Restituisce i documenti filtrati per impianto, se selezionato
  List<Map<String, dynamic>> get _filteredDocs {
    if (_selectedImpianto == null || _selectedImpianto!.isEmpty) {
      return _allDocs;
    }
    return _allDocs.where((d) => d['impiantoId'] == _selectedImpianto).toList();
  }

  String _ipfsUrl(String cid) => "https://$cid.ipfs.w3s.link";

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();

    return Scaffold(
      appBar: AppBar(title: const Text('Archivio documenti')),
      body: _allDocs.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // 🔹 Pulsante per scansionare QR
                ElevatedButton.icon(
                  icon: const Icon(Icons.qr_code_scanner),
                  label: const Text("Scansiona QR documento"),
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => QrScanPage(
                          backendBaseUrl: AppConfig.apiBaseUrl,
                          jwt: auth.token!,
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 10),

                // 🔹 Filtro per impianto
                Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: DropdownButton<String>(
                    value: _selectedImpianto,
                    hint: const Text("Filtra per impianto"),
                    items: _allDocs
                        .map((doc) => doc['impiantoId'] as String)
                        .toSet() // impianti unici
                        .map((impiantoId) => DropdownMenuItem<String>(
                              value: impiantoId,
                              child: Text(impiantoId),
                            ))
                        .toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedImpianto = value;
                      });
                    },
                  ),
                ),
                const Divider(),

                // 🔹 Lista documenti
                Expanded(
                  child: _filteredDocs.isEmpty
                      ? const Center(child: Text("Nessun documento trovato."))
                      : ListView.builder(
                          itemCount: _filteredDocs.length,
                          itemBuilder: (context, index) {
                            final doc = _filteredDocs[index];
                            return Card(
                              margin: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                              child: ListTile(
                                title: Text("Impianto: ${doc['impiantoId']}"),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text("PDF CID: ${doc['pdfCid']}"),
                                    if (doc['qrCid'] != null)
                                      Text("QR CID: ${doc['qrCid']}"),
                                    Text("TxHash: ${doc['txHash']}"),
                                  ],
                                ),
                                onTap: () {
                                  final pdfUrl = _ipfsUrl(doc['pdfCid']);
                                  debugPrint("Aprire $pdfUrl");
                                  // 👉 opzionale: apri in browser con url_launcher
                                },
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }
}
