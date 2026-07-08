import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'auth_service.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(HoneyFarmApp());
}

class HoneyFarmApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Honey Farm',
      theme: ThemeData(primarySwatch: Colors.amber),
      home: AuthGate(),
    );
  }
}

class AuthGate extends StatefulWidget {
  @override
  _AuthGateState createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  final AuthService _authService = AuthService();
  @override
  void initState() {
    super.initState();
    _authService.authStateChanges().listen((user) {
      setState(() {});
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = _authService._auth.currentUser;
    if (user == null) {
      return LoginScreen(authService: _authService);
    }
    return HomeScreen();
  }
}
