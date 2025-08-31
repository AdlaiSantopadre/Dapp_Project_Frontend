import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/auth_state.dart';
import '../services/impianti_service.dart'; 

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}
  class _HomePageState extends State<HomePage> {
  List<dynamic> _impianti = [];
  String? _selectedImpianto;

  @override
  void initState() {
  super.initState();
  _loadImpianti();
  }
  /*funzione per caricare gli impianti dal backend e popolare il dropdown*/
  Future<void> _loadImpianti() async {
    try {
      final impianti = await ImpiantiService().listImpianti();
      setState(() => _impianti = impianti);
    } catch (e) {
      print("Errore caricamento impianti: $e");
      if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Errore caricamento impianti: $e")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Home Page"
        ),
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
        child: SingleChildScrollView(
          child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Utente: ${auth.username ?? '-'}'),
            Text('Ruolo: ${auth.role ?? '-'}'),
            Text('ETH: ${auth.ethAddress ?? '-'}'),
            const SizedBox(height: 24),
            // Caso CERTIFICATORE
            if (auth.hasRole('CERTIFICATORE_ROLE')) ...[
             //Dropdown per scegliere impianto
            DropdownButton<String>(
              value: _selectedImpianto,
              hint: const Text("Seleziona impianto"),
              items: _impianti.map<DropdownMenuItem<String>>((impianto) {
                return DropdownMenuItem<String>(
                  value: impianto['_id'],
                  child: Text(impianto['nome']),
                );
              }).toList(),
              onChanged: (val) {
                setState(() => _selectedImpianto = val);
                context.read<AuthState>().setImpiantoId(val!);
              },
            ),
            const SizedBox(height: 24),
            
            // Pulsante Upload visibile solo per CERTIFICATORE_ROLE
            if (auth.hasRole('CERTIFICATORE_ROLE')) ...[
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pushNamed('/upload');
                },
                child: const Text('Carica documento (Certificatore)'),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pushNamed('/register');
                },
                child: const Text('Registra su blockchain'),
            
              ),
          ],
          ],
        // Caso MANUTENTORE o ISPETTORE → solo consultazione
            if (auth.role == 'MANUTENTORE_ROLE' || auth.role == 'ISPETTORE_ROLE')
              ElevatedButton(
                onPressed: () => Navigator.pushNamed(context, '/documents'),
                child: const Text("Consulta documenti"),
              ),
        ]  
        ),
      ),
      )
    );
  }
}
