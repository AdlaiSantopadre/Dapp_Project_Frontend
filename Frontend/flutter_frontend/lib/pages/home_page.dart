import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/auth_state.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
        actions: [
          IconButton(
            onPressed: () async {
              await context.read<AuthState>().logout();
              if (context.mounted) {
                Navigator.of(context).pushReplacementNamed('/login');
              }
            },
            icon: const Icon(Icons.logout),
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Utente: ${auth.username ?? '-'}'),
            Text('Ruolo: ${auth.role ?? '-'}'),
            Text('ETH: ${auth.ethAddress ?? '-'}'),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pushNamed('/documents');
              },
              child: const Text('Visualizza Documenti'),
            ),
            const SizedBox(height: 16),
            // Pulsante Upload visibile solo per CERTIFICATORE_ROLE
            if (auth.hasRole('CERTIFICATORE_ROLE'))
              ElevatedButton(
                onPressed: () {
                 
                  Navigator.of(context).pushNamed('/upload');
                },
                child: const Text('Carica documento (Certificatore)'),
              ),
          ],
        ),
      ),
    );
  }
}
