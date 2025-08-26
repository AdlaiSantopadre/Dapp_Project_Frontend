import 'package:flutter/material.dart';
import '../services/documents_service.dart';

class DocumentsPage extends StatefulWidget {
  const DocumentsPage({super.key});

  @override
  State<DocumentsPage> createState() => _DocumentsPageState();
}

class _DocumentsPageState extends State<DocumentsPage> {
  final _service = DocumentsService();
  late Future<List<dynamic>> _futureDocs;

  @override
  void initState() {
    super.initState();
    _futureDocs = _service.listDocuments();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Documenti')),
      body: FutureBuilder<List<dynamic>>(
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
              final doc = docs[index] as Map<String, dynamic>;
              return ListTile(
                title: Text(doc['title'] ?? 'Documento $index'),
                subtitle: Text('CID: ${doc['cid'] ?? '-'}'),
                onTap: () {
                  // per esempio: aprire i dettagli
                },
              );
            },
          );
        },
      ),
    );
  }
}
