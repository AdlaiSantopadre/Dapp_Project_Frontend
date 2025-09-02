import 'package:flutter/material.dart';
import 'package:flutter_frontend/config.dart';
import 'package:flutter_frontend/services/upload_service.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../state/auth_state.dart';
import 'package:dio/dio.dart';
import 'package:screenshot/screenshot.dart';


class QrCodePage extends StatefulWidget {
  final String cid;
  final String txHash;
  final String impiantoId;

  const QrCodePage({
    super.key,
    required this.cid,
    required this.txHash,
    required this.impiantoId,
      });


   @override
  State<QrCodePage> createState() => _QrCodePageState();
}
  class _QrCodePageState extends State<QrCodePage> {
  final ScreenshotController screenshotController = ScreenshotController();
  bool _loadingQr = false;
  String? documentId; // id Mongo restituito dal POST
      

  Future<void> registraDocumento(AuthState authState) async {
      try {
        final dio = Dio();
        try{
        final response = await dio.post(
          "${AppConfig.apiBaseUrl}/archivio-documenti", //  backend URL
          data: {
          "impiantoId": widget.impiantoId,
          "pdfCid": widget.cid,
          "txHash": widget.txHash,
          "certificatore": authState.ethAddress, // 🔧 prendi da AuthState
        },
        options: Options(
          headers: {"Authorization": "Bearer ${authState.token}"}, // 👈 token da AuthState
        ),
      );
      // ✅ Estrai l'ID dal payload corretto
      final data = response.data;
      final newId = data["documento"]?["id"];
      setState(() {
        documentId = newId;
      print(" Documento creato con id=$documentId");
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Documento creato su backend ✅")),
      );
      });
    } on DioException catch (e) {
      if (e.response?.statusCode == 409) {
      print(" Documento già esistente: ${e.response?.data}");
        } else {
      print(" Errore backend: ${e.response?.statusCode} ${e.response?.data}");
     ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Errore backend: ${e.response?.statusCode}")),
        );
    }
  }
      
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Errore POST : $e")),
      );
    }
  }
Future<void> completaConQr(AuthState authState) async {
  print("❌ documentId nullo, devi prima fare POST");
  if (documentId == null) throw Exception("Screenshot non valido");

  
  setState(() => _loadingQr = true);
  try {
    final imageBytes = await screenshotController.capture();
    print("📸 Screenshot size: ${imageBytes?.length}");
    if (imageBytes == null) return;

   // usa UploadService invece di dio.post diretto 
  final uploadService = UploadService();
    final uploadResp = await uploadService.uploadImageBytes(
    imageBytes,
    token: authState.token! // passa il token
    );
    print("📤 Upload response: $uploadResp");

    final qrCid = uploadResp['cid'];
  if (qrCid == null) throw Exception("Backend non ha restituito CID");
  print("📌 Uso token: ${authState.token}");
  print("📌 PATCH su /archivio-documenti/$documentId/qr con qrCid=$qrCid");
  final dio = Dio();
    final patchResp = await dio.patch(
      "${AppConfig.apiBaseUrl}/archivio-documenti/$documentId/qr",
      data: {"qrCid": qrCid},
      options: Options(
        headers: {"Authorization": "Bearer ${authState.token}"},
      ),
    ); 
   print("✅ PATCH response: ${patchResp.data}");

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("QR CID salvato in archivio ✅")),
    ); 
    // Mostra un dialogo con scelte
    if (!mounted) return;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
    final authState = Provider.of<AuthState>(context, listen: false);
    return AlertDialog(
        title: const Text("Operazione completata"),
        content: const Text("Operazione completata con successo."),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop(); // chiudi dialog
              Navigator.of(context).pushNamedAndRemoveUntil(
                '/home', // 👈 tua route della home page
                (route) => false,
              );
            },
            child: const Text("Nuovo documento"),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop(); // chiudi dialog
              authState.logout();
              Navigator.of(context).pushNamedAndRemoveUntil(
                '/login',
                (route) => false,
              );
            },
            child: const Text("Esci"),
          ),
        ],
      );
      },
    );
  } catch (e,st) {
     print("❌ Errore completaConQr: $e\n$st");
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Errore PATCH archivio: $e")),
    );
  }finally {
      setState(() => _loadingQr = false);
    }
}



  @override
  Widget build(BuildContext context) {  
    final authState = Provider.of<AuthState>(context, listen: false);
    final ipfsUrl = "https://${widget.cid}.ipfs.w3s.link";
    final sepoliaTxUrl = "https://sepolia.etherscan.io/tx/${widget.txHash}";

    return Scaffold(
      appBar: AppBar(title: const Text("QR Code Documento")),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Screenshot(
              controller: screenshotController,
            child:QrImageView(
              data: ipfsUrl,
              version: QrVersions.auto,
              size: 250.0,
            ),
            ),
            const SizedBox(height: 20),
            SelectableText(ipfsUrl, textAlign: TextAlign.center),
            const SizedBox(height: 10),
            SelectableText(sepoliaTxUrl, textAlign: TextAlign.center),
            const SizedBox(height: 40),
            ElevatedButton.icon(
              onPressed: () => registraDocumento(authState),
              icon: const Icon(Icons.cloud_upload),
              label: const Text("1. Registra documento"),
            ),
            const SizedBox(
              height: 20),
            ElevatedButton.icon(
              onPressed: _loadingQr ? null : () => completaConQr(authState),
              icon: _loadingQr
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.qr_code),
              label: Text(_loadingQr ? "Attendere..." : "2. Completa con QR"),
            ),  
            /*
            ElevatedButton(
              onPressed: _loading ? null : _uploadFile,
              child: _loading
                  ? const CircularProgressIndicator()
                  : const Text('Carica su IPFS'),
            ),
            ElevatedButton.icon(
              onPressed: () => registraDocumento(authState),
              icon: const Icon(Icons.cloud_upload),
              label: const Text("Registra su backend"),
            )*/
          ],
        ),
      ),
    );
  }
}
