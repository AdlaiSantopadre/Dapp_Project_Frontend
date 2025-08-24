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

   // ✅ Nuovi campi per ultimo documento
  String? _lastHash;
  String? _lastCid;
  String? _lastMetadata;

  String? get lastHash => _lastHash;
  String? get lastCid => _lastCid;
  String? get lastMetadata => _lastMetadata;

  void setLastDocument({
    required String hash,
    required String cid,
    required String metadata,
  }) {
    _lastHash = hash;
    _lastCid = cid;
    _lastMetadata = metadata;
    notifyListeners();
  }

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
    // ✅ reset anche i dati documento quando fai logout
    _lastHash = null;
    _lastCid = null;
    _lastMetadata = null;
    await bootstrap();
  }

  bool get isAuthenticated => (_token ?? '').isNotEmpty;
  bool hasRole(String r) => (_role ?? '') == r;
}