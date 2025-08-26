import 'dart:io';
import 'package:dio/dio.dart';
import 'api_client.dart';


class DocumentsService {
  final _api = ApiClient();

  Future<List<dynamic>> listDocuments() async {
    final res = await _api.dio.get('/documents');
    if (res.statusCode == 200) {
      return (res.data as List).cast<dynamic>();
    } else {
      throw Exception('Errore caricamento documenti');
    }
  }

  Future<Map<String, dynamic>> getDocument(String id) async {
    final res = await _api.dio.get('/documents/$id');
    return (res.data as Map<String, dynamic>);
  }

  /// metodo per caricare documento PDF e associare impianto
  Future<Map<String, dynamic>> uploadDocument(File file, String impiantoId) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(file.path, filename: file.uri.pathSegments.last),
      'impiantoId': impiantoId,
    });

    final res = await _api.dio.post('/documents/upload', data: formData);

    if (res.statusCode == 200 || res.statusCode == 201) {
      return res.data as Map<String, dynamic>;
    } else {
      throw Exception('Errore upload documento');
    }
  }
}

