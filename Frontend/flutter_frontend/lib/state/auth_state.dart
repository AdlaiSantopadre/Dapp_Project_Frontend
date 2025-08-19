import 'package:flutter/foundation.dart';
import '../services/secure_store.dart';
import '../services/auth_service.dart';

class AuthState extends ChangeNotifier {
  final _auth = AuthService();

  bool _busy = false;
  bool get busy => _busy;

  String? _token;
  String? _role;
  String? _username;
  String? _eth;

  String? get token => _token;
  String? get role => _role;
  String? get username => _username;
  String? get ethAddress => _eth;

  Future<void> bootstrap() async {
    _token    = await SecureStore.token;
    _role     = await SecureStore.role;
    _username = await SecureStore.username;
    _eth      = await SecureStore.ethAddress;
    notifyListeners();
  }

  Future<bool> login(String user, String pass) async {
    _busy = true; notifyListeners();
    try {
      await _auth.login(user, pass);
      await bootstrap();
      return true;
    } catch (_) {
      return false;
    } finally {
      _busy = false; notifyListeners();
    }
  }

  Future<void> logout() async {
    await _auth.logout();
    await bootstrap();
  }

  bool get isAuthenticated => (_token ?? '').isNotEmpty;
  bool hasRole(String r) => (_role ?? '') == r;
}