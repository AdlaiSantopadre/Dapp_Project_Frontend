class AppConfig {
  static const authBaseUrl =
      String.fromEnvironment('AUTH_BASE_URL', defaultValue: 'http://127.0.0.1:8081/auth');
  static const apiBaseUrl =
      String.fromEnvironment('API_BASE_URL', defaultValue: 'http://127.0.0.1:8081');
} 