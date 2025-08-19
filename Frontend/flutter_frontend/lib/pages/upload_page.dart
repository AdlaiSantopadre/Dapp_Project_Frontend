import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../services/upload_service.dart';

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
    setState(() {
      _loading = true;
      _result = null;
    });
    try {
      final res = await _service.uploadPdf(_selectedFile!.path);
      setState(() {
        _result = "✅ Upload riuscito!\nCID: ${res['cid']}\nTx: ${res['txHash']}";
      });
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
    return Scaffold(
      appBar: AppBar(title: const Text('Carica Documento')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
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
