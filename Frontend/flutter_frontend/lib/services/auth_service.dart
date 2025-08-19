/*
Nota: se il tuo /login non ritorna user ma solo il token,
 puoi poi chiamare /auth/me con il client protetto
(_api.dio.get('/auth/me')) e recuperare i dati.

*/
import 'package:dio/dio.dart';
import '../config.dart';
import 'api_client.dart';
import 'secure_store.dart';

class AuthService {
  final Dio _dio = Dio(BaseOptions(baseUrl: AppConfig.authBaseUrl));
  final ApiClient _api = ApiClient();

  Future<void> login(String username, String password) async {
    // 1) Chiamo /auth/login → ricevo { token, user }
    final res = await _dio.post('/login', data: {
      'username': username,
      'password': password,
    });

    final token = res.data['token'] as String;
    final user = res.data['user'] as Map<String, dynamic>? ?? {};

    // 2) Salvo token e dati utente (role, username, ethAddress)
    await SecureStore.saveSession(
      token: token,
      role: (user['role'] ?? '') as String,
      username: (user['username'] ?? '') as String,
      ethAddress: (user['ethAddress'] ?? user['address'] ?? '') as String,
    );
  }

  Future<void> logout() async {
    await SecureStore.clear();
  }
}