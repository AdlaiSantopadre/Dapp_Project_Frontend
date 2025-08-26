import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'state/auth_state.dart';
import 'pages/login_page.dart';
import 'pages/home_page.dart';
import 'pages/documents_page.dart';
import 'pages/upload_page.dart';
import 'pages/register_document_screen.dart'; 

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => AuthState()..bootstrap(),
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();
    final startRoute = auth.isAuthenticated ? '/home' : '/login';

    return MaterialApp(
      title: 'DApp Frontend',
      initialRoute: startRoute,
      routes: {
        '/login': (_) => const LoginPage(),
        '/home' : (_) => const HomePage(),
        '/documents': (_) => const DocumentsPage(),
        '/upload': (_) => const UploadPage(),
        '/register': (_) => const RegisterDocumentScreen(),
      },
    );
  }
}

