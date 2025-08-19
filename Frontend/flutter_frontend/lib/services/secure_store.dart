import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStore {
  static const _storage = FlutterSecureStorage();

  static const _kToken     = 'jwt_token';
  static const _kRole      = 'user_role';
  static const _kUsername  = 'username';
  static const _kEth       = 'eth_address';

  static Future<void> saveSession({
    required String token,
    required String role,
    required String username,
    required String ethAddress,
  }) async {
    await _storage.write(key: _kToken, value: token);
    await _storage.write(key: _kRole, value: role);
    await _storage.write(key: _kUsername, value: username);
    await _storage.write(key: _kEth, value: ethAddress);
  }

  static Future<String?> get token      => _storage.read(key: _kToken);
  static Future<String?> get role       => _storage.read(key: _kRole);
  static Future<String?> get username   => _storage.read(key: _kUsername);
  static Future<String?> get ethAddress => _storage.read(key: _kEth);

  static Future<void> clear() async => _storage.deleteAll();
}