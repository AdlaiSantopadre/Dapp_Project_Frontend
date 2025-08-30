import 'package:flutter/material.dart';
import '../services/archivio_documenti_service.dart';

class DocumentsPage extends StatefulWidget {
  const DocumentsPage({super.key});

  @override
  State<DocumentsPage> createState() => _DocumentsPageState();
}

class _DocumentsPageState extends State<DocumentsPage> {
  final _service = ArchivioDocumentiService();
  late Future<List<Map<String, dynamic>>> _futureDocs;

  @override
  void initState() {
    super.initState();
    // 🔧 qui puoi anche passare un impiantoId specifico se vuoi filtrare
    _futureDocs = _service.listByImpianto("IMPIANTO-1234");
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Archivio documenti')),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _futureDocs,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Errore: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('Nessun documento trovato.'));
          }

          final docs = snapshot.data!;
          return ListView.builder(
            itemCount: docs.length,
            itemBuilder: (context, index) {
              final doc = docs[index];
              return ListTile(
                title: Text("Impianto: ${doc['impiantoId']}"),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("PDF CID: ${doc['pdfCid']}"),
                    if (doc['qrCid'] != null) Text("QR CID: ${doc['qrCid']}"),
                    Text("TxHash: ${doc['txHash']}"),
                  ],
                ),
                onTap: () {
                  // 👉 esempio: aprire ipfsUrl in browser
                  final ipfsUrl = "https://${doc['pdfCid']}.ipfs.w3s.link";
                  print("Aprire $ipfsUrl");
                  // oppure Navigator.push(...) per dettagli
                },
              );
            },
          );
        },
      ),
    );
  }
}
