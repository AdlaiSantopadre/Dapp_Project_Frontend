import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../state/auth_state.dart';
import 'package:dio/dio.dart';


class QrCodePage extends StatelessWidget {
  final String cid;
  final String txHash;

  const QrCodePage({
    super.key,
    required this.cid,
    required this.txHash,
      });

  @override
  Widget build(BuildContext context) {
  final authState = Provider.of<AuthState>(context, listen: false);

  final cid        = authState.lastCid ?? "";
  final txHash     = authState.lastHash ?? "";
  final impiantoId = authState.selectedImpiantoId ?? "";
  final certificatore = authState.ethAddress ?? "";
  final token      = authState.token ?? "";    
  final String  ipfsUrl = "https://$cid.ipfs.w3s.link";
  final String sepoliaTxUrl = "https://sepolia.etherscan.io/tx/$txHash";
  Future<void> registraDocumento() async {
      try {
        final dio = Dio();
        final response = await dio.post(
          "http://localhost:8080/archivio-documenti", // 🔧 backend URL
          data: {
            "impiantoId": impiantoId,
            "pdfCid": cid,
            "txHash": txHash,
            "certificatore": certificatore,
          },
          options: Options(headers: {"Authorization": "Bearer $token"}),
        );
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Documento registrato in archivio ✅")),
        );
        print("Registrazione archivio: ${response.data}");
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Errore registrazione: $e")),
        );
      }
    }

    return Scaffold(
      appBar: AppBar(title: const Text("QR Code Documento")),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            QrImageView(
              data: ipfsUrl,
              version: QrVersions.auto,
              size: 250.0,
            ),
            const SizedBox(height: 20),
            Text("CID: $cid", textAlign: TextAlign.center),
            const SizedBox(height: 10),
            SelectableText(
              ipfsUrl,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.blue),
            ),
            const SizedBox(height: 20),
            Text("Tx Hash: $txHash"),
            SelectableText(
              sepoliaTxUrl,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.blue),
            ),
            const SizedBox(height: 20),

            ElevatedButton.icon(
              onPressed: registraDocumento,
              icon: const Icon(Icons.cloud_upload),
              label: const Text("Registra su backend"),
            )
          ],
        ),
      ),
    );
  }
}
