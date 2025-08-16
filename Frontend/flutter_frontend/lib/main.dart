import 'package:flutter/material.dart';
import 'config.dart'; // Assicurati di avere il file config.dart nella stessa cartella
import 'qr_scan_page.dart'; // Assicurati di avere il file qr_scan.page.dart nella stessa cartella

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Doc Registry',
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: Colors.indigo,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Doc Registry (staging)')),
      body: Center(
        child:ElevatedButton(
          onPressed: () {
            Navigator.of(context).push(
                MaterialPageRoute(
                    builder: (context) => QrScanPage(
                        backendBaseUrl: baseUrl,
                        jwt: jwt, // oppure await getToken() se dinamico
                  ),
                ),
            );
          },
          child: const Text('Scansiona QR 📷'),
          ),
      ),
    );
  }
}
