class AppConfig {
  static const authBaseUrl =
      String.fromEnvironment('AUTH_BASE_URL', defaultValue: 'https://auth-service-production-ff5a.up.railway.app/auth');

  static const apiBaseUrl =
      String.fromEnvironment('API_BASE_URL', defaultValue: 'https://project-backend-production-14a8.up.railway.app');
}
