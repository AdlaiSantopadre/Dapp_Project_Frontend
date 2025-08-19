import 'package:dio/dio.dart';
import '../config.dart';
import 'secure_store.dart';

class ApiClient {
  final Dio dio;

  ApiClient._internal(this.dio);

  factory ApiClient() {
    final dio = Dio(BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 20),
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await SecureStore.token;
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (e, handler) async {
        if (e.response?.statusCode == 401) {
          await SecureStore.clear();
        }
        handler.next(e);
      },
    ));

    return ApiClient._internal(dio);
  }
}