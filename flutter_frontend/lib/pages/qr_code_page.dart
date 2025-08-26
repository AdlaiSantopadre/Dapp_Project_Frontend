import 'package:flutter/material.dart';
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
  String? documentId; // id Mongo restituito dal POST
      

  Future<void> registraDocumento(AuthState authState) async {
      try {
        final dio = Dio();
        final response = await dio.post(
          "http://localhost:8080/archivio-documenti", //  backend URL
          data: {
          "impiantoId": widget.impiantoId,
          "pdfCid": widget.cid,
          "txHash": widget.txHash,
          "certificatore": authState.ethAddress, // 🔧 prendi da AuthState
        }
        ,options: Options(
          headers: {"Authorization": "Bearer ${authState.token}"}, // 👈 token da AuthState
        ),
      );
      setState(() {
        documentId = response.data["id"]; // salva _id
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Documento creato su backend ✅")),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Errore POST archivio: $e")),
      );
    }
  }
Future<void> completaConQr(AuthState authState) async {
  if (documentId == null) return;

  try {
    final imageBytes = await screenshotController.capture();
    if (imageBytes == null) return;

    final dio = Dio();
    final formData = FormData.fromMap({
      "file": MultipartFile.fromBytes(imageBytes, filename: "qrcode.png"),
    });

    final uploadResp = await dio.post(
      "http://10.0.2.2:8080/documents/upload",
      data: formData,
      options: Options(
        headers: {"Authorization": "Bearer ${authState.token}"},
      ),
    );

    final qrCid = uploadResp.data["cid"];

    final patchResp = await dio.patch(
      "http://10.0.2.2:8080/archivio-documenti/$documentId/qr",
      data: {"qrCid": qrCid},
      options: Options(
        headers: {"Authorization": "Bearer ${authState.token}"},
      ),
    );

    // ✅ conferma dal backend
    final message = patchResp.data["message"] ?? "Documento completato";

    // Mostra un dialogo con scelte
    if (!mounted) return;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: const Text("Operazione completata"),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // chiudi dialog
              Navigator.of(context).pushNamedAndRemoveUntil(
                '/home', // 👈 tua route della home page
                (route) => false,
              );
            },
            child: const Text("Nuovo documento"),
          ),
          TextButton(
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
      ),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Errore PATCH archivio: $e")),
    );
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
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () => completaConQr(authState),
              icon: const Icon(Icons.qr_code),
              label: const Text("2. Completa con QR"),
            ),  
            ElevatedButton.icon(
              onPressed: () => registraDocumento(authState),
              icon: const Icon(Icons.cloud_upload),
              label: const Text("Registra su backend"),
            )
          ],
        ),
      ),
    );
  }
}
