import 'package:flutter/material.dart';
import '../auth_service.dart';

class SignupScreen extends StatefulWidget {
  final AuthService authService;
  SignupScreen({required this.authService});
  @override
  _SignupScreenState createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _loading = false;
  String? _error;

  void _signup() async {
    setState(() { _loading = true; _error = null; });
    try {
      await widget.authService.signUp(_emailCtrl.text.trim(), _passCtrl.text);
      Navigator.pop(context);
    } catch (e) {
      setState(() { _error = e.toString(); });
    } finally {
      setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Create account')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: _emailCtrl, decoration: InputDecoration(labelText: 'Email')),
            TextField(controller: _passCtrl, decoration: InputDecoration(labelText: 'Password'), obscureText: true),
            if (_error != null) Padding(padding: EdgeInsets.only(top:8), child: Text(_error!, style: TextStyle(color: Colors.red))),
            SizedBox(height: 12),
            ElevatedButton(onPressed: _loading ? null : _signup, child: Text('Create account')),
          ],
        ),
      ),
    );
  }
}
