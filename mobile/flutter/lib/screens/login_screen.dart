import 'package:flutter/material.dart';
import '../auth_service.dart';
import 'signup_screen.dart';

class LoginScreen extends StatefulWidget {
  final AuthService authService;
  LoginScreen({required this.authService});
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _loading = false;
  String? _error;

  void _login() async {
    setState(() { _loading = true; _error = null; });
    try {
      await widget.authService.signIn(_emailCtrl.text.trim(), _passCtrl.text);
    } catch (e) {
      setState(() { _error = e.toString(); });
    } finally {
      setState(() { _loading = false; });
    }
  }

  void _googleSignIn() async {
    setState(() { _loading = true; _error = null; });
    try {
      await widget.authService.signInWithGoogle();
    } catch (e) {
      setState(() { _error = e.toString(); });
    } finally {
      setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Sign in')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: _emailCtrl, decoration: InputDecoration(labelText: 'Email')),
            TextField(controller: _passCtrl, decoration: InputDecoration(labelText: 'Password'), obscureText: true),
            if (_error != null) Padding(padding: EdgeInsets.only(top:8), child: Text(_error!, style: TextStyle(color: Colors.red))),
            SizedBox(height: 12),
            ElevatedButton(onPressed: _loading ? null : _login, child: Text('Sign in')),
            SizedBox(height: 8),
            ElevatedButton(onPressed: _loading ? null : _googleSignIn, child: Text('Sign in with Google')),
            SizedBox(height: 12),
            TextButton(onPressed: () { Navigator.push(context, MaterialPageRoute(builder: (_) => SignupScreen(authService: widget.authService))); }, child: Text('Create account'))
          ],
        ),
      ),
    );
  }
}
