import 'package:flutter/material.dart';

void main() {
  runApp(HoneyFarmApp());
}

class HoneyFarmApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Honey Farm',
      theme: ThemeData(primarySwatch: Colors.amber),
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Honey Farm'),
        actions: [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 12),
            child: Row(children: [Icon(Icons.monetization_on), SizedBox(width:4), Text('0')]),
          )
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Welcome, Farmer!', style: TextStyle(fontSize: 24)),
            SizedBox(height: 20),
            ElevatedButton(onPressed: () {}, child: Text('Harvest Honey')),
            SizedBox(height: 10),
            ElevatedButton(onPressed: () {}, child: Text('Flower Shop')),
          ],
        ),
      ),
    );
  }
}
