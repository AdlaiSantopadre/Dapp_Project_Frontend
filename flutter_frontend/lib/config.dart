class AppConfig {
  static const authBaseUrl =
      String.fromEnvironment('AUTH_BASE_URL', defaultValue: 'http://192.168.1.232:8081/auth');
  static const apiBaseUrl =
      String.fromEnvironment('API_BASE_URL', defaultValue: 'http://192.168.1.232:8080');
} 