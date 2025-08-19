// Qui assumo che tu abbia un endpoint /documents 
// che ritorna un array di documenti e /documents/:id per i dettagli.
//  Adattalo se il tuo backend usa nomi diversi.


import 'api_client.dart';

class DocumentsService {
  final _api = ApiClient();

  Future<List<dynamic>> listDocuments() async {
    final res = await _api.dio.get('/documents'); 
    // il backend dovrebbe restituire una lista JSON
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
}
