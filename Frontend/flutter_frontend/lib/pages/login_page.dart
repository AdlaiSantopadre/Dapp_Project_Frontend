import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/auth_state.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _form = GlobalKey<FormState>();
  final _userCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  String? _error;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();

    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _form,
          child: Column(
            children: [
              TextFormField(
                controller: _userCtrl,
                decoration: const InputDecoration(labelText: 'Username'),
                validator: (v) => (v == null || v.isEmpty) ? 'Obbligatorio' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _passCtrl,
                decoration: const InputDecoration(labelText: 'Password'),
                obscureText: true,
                validator: (v) => (v == null || v.isEmpty) ? 'Obbligatorio' : null,
              ),
              const SizedBox(height: 20),
              if (_error != null)
                Text(_error!, style: const TextStyle(color: Colors.red)),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: auth.busy ? null : () async {
                    if (_form.currentState!.validate()) {
                      final ok = await context.read<AuthState>().login(
                        _userCtrl.text.trim(),
                        _passCtrl.text.trim(),
                      );
                      if (!mounted) return;
                      if (!ok) {
                        setState(() => _error = 'Credenziali non valide o server non raggiungibile.');
                      } else if (mounted) {
                        Navigator.of(context).pushReplacementNamed('/home');
                      }
                    }
                  },
                  child: auth.busy ? const CircularProgressIndicator() : const Text('Entra'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
