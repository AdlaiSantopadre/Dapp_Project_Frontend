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
  theme: ThemeData(
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ButtonStyle(
        backgroundColor: WidgetStateProperty.resolveWith<Color>(
          (Set<WidgetState> states) {
            if (states.contains(WidgetState.pressed)) {
              return Colors.green; // premuto
            }
            return Colors.blue; // default
          },
        ),
      ),
    ),
  ),
  initialRoute: startRoute,
  routes: {
    '/login': (_) => const LoginPage(),
    '/home': (_) => const HomePage(),
    
    '/upload': (_) => const UploadPage(),
    '/register': (_) => const RegisterDocumentScreen(),
    '/documents': (_) => DocumentsPage(),
  },
);
  }
}

