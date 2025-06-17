import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/home_data.dart';

class ApiService {
  static const String _baseUrl = 'https://smartyapp.co.il/api/v1';

  Future<HomeData> fetchHomeData() async {
    final response = await http.get(Uri.parse('$_baseUrl/marketplace/home'));

    if (response.statusCode == 200) {
      return HomeData.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load home data');
    }
  }
}
