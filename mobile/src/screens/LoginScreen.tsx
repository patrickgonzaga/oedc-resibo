import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  Image,
  StatusBar
} from 'react-native';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react-native';
import ThemeToggle from '../components/ThemeToggle';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, isDarkMode } = useStore();
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setUser(data.user);
      navigation.navigate('Dashboard');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className={`flex-1 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Background decoration */}
      <View className="absolute top-0 left-0 right-0 h-96 opacity-30">
        <View className="absolute top-[-50] left-[-50] w-64 h-64 bg-blue-600 rounded-full blur-[80px]" />
        <View className="absolute top-[-50] right-[-50] w-64 h-64 bg-teal-600 rounded-full blur-[80px]" />
      </View>

      <View className="absolute top-12 right-6">
        <ThemeToggle />
      </View>

      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-10">
          <View className="relative">
            <View className="absolute -inset-4 bg-blue-500/20 rounded-full blur-2xl" />
            <Image 
              source={require('../../assets/resibo-mascot.png')} 
              className="w-48 h-48"
              resizeMode="contain"
            />
          </View>
          <Text className={`text-5xl font-black tracking-tighter mt-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Resibo</Text>
          <Text className={`text-base font-medium mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Intelligence for your utility tracking</Text>
        </View>

        {error ? (
          <View className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-6">
            <Text className="text-red-500 text-center text-sm font-bold">{error}</Text>
          </View>
        ) : null}

        <View className="space-y-4">
          <View className="space-y-2">
            <Text className={`text-xs font-bold uppercase tracking-widest ml-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Email Address</Text>
            <View className={`flex-row items-center px-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Mail size={20} color={isDarkMode ? "#64748b" : "#94a3b8"} />
              <TextInput
                className={`flex-1 ml-3 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                placeholder="name@example.com"
                placeholderTextColor={isDarkMode ? "#475569" : "#94a3b8"}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View className="space-y-2">
            <Text className={`text-xs font-bold uppercase tracking-widest ml-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Password</Text>
            <View className={`flex-row items-center px-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Lock size={20} color={isDarkMode ? "#64748b" : "#94a3b8"} />
              <TextInput
                className={`flex-1 ml-3 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                placeholder="••••••••"
                placeholderTextColor={isDarkMode ? "#475569" : "#94a3b8"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleLogin}
            disabled={loading}
            className="bg-blue-600 py-5 rounded-[24px] flex-row items-center justify-center shadow-xl shadow-blue-500/40"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-white text-xl font-bold">Sign In</Text>
                <ArrowRight size={20} color="#fff" className="ml-2" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Register')}
          className="mt-8 items-center"
        >
          <Text className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} font-medium`}>
            Don't have an account? <Text className="text-blue-500 font-bold">Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
