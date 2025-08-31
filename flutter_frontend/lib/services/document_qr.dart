import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

class DocumentQrWidget extends StatelessWidget {
  final String cid;
  final String txHash;

  const DocumentQrWidget({
    super.key,
    required this.cid,
    required this.txHash,
  });

  @override
  Widget build(BuildContext context) {
    final String ipfsUrl = "https://$cid.ipfs.w3s.link";
    final String sepoliaTxUrl = "https://sepolia.etherscan.io/tx/$txHash";

    return Scaffold(
      appBar: AppBar(title: const Text("Documento Certificato")),
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
            Text("Link IPFS: $ipfsUrl",
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.blue)),
            const SizedBox(height: 20),
            Text("Tx Hash: $txHash"),
            Text("Etherscan: $sepoliaTxUrl",
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.blue)),
          ],
        ),
      ),
    );
  }
}
