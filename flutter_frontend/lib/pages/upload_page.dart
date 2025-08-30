import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../services/upload_service.dart';
import 'package:provider/provider.dart';
import '../state/auth_state.dart';


class UploadPage extends StatefulWidget {
  const UploadPage({super.key});

  @override
  State<UploadPage> createState() => _UploadPageState();
}

class _UploadPageState extends State<UploadPage> {
  final _service = UploadService();

  File? _selectedFile;
  String? _result;
  bool _loading = false;

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );
    if (result != null && result.files.single.path != null) {
      setState(() {
        _selectedFile = File(result.files.single.path!);
      });
    }
  }

  Future<void> _uploadFile() async {
    if (_selectedFile == null) return;

    final auth = context.read<AuthState>();
    if (auth.selectedImpiantoId == null) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Seleziona prima un impianto in Home")),
    );
    return;
    }
    setState(() {
      _loading = true;
      _result = null;
    });
    try {
      final res = await _service.uploadPdf(_selectedFile!.path, token: auth.token !);
      // ✅ salva i dati nel provider AuthState
      
      auth.setLastDocument(
        hash: res['hash'],
        cid: res['cid'],
        metadata: res['metadata'] ?? '{"name":"${_selectedFile!.path.split('/').last}","mime":"application/pdf"}',
      );

      setState(() {
        _result = "✅ Upload riuscito!\nCID: ${res['cid']}\nTx: ${res['txHash']}";
      });
      // ✅ dopo upload vai direttamente a RegisterDocumentScreen
      if (mounted) {
        Navigator.of(context).pushNamed('/register');
      }
    } catch (e) {
      setState(() {
        _result = "❌ Errore: $e";
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
     final auth = context.watch<AuthState>();
    return Scaffold(
      appBar: AppBar(title: const Text('Carica Documento')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ✅ Mostra impianto selezionato
          Card(
            color: Colors.grey[100],
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  const Icon(Icons.factory, color: Colors.blue),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      auth.selectedImpiantoId != null
                          ? "Impianto selezionato: ${auth.selectedImpiantoId}"
                          : "⚠️ Nessun impianto selezionato (sceglilo in Home)",
                      style: const TextStyle(fontSize: 16),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

            ElevatedButton(
              onPressed: _pickFile,
              child: const Text('Scegli PDF'),
            ),
            if (_selectedFile != null) Text('Selezionato: ${_selectedFile!.path}'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loading ? null : _uploadFile,
              child: _loading
                  ? const CircularProgressIndicator()
                  : const Text('Carica su IPFS'),
            ),
            const SizedBox(height: 24),
            if (_result != null) Text(_result!),
          ],
        ),
      ),
    );
  }
}
