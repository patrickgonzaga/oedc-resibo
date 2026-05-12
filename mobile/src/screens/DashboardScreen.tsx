import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Image,
  TextInput,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../store/useStore';
import { UtilityType, Receipt, ExtractedData } from '../types';
import { performOCR } from '../services/ocrService';
import { parseReceiptText } from '../services/parserService';
import VerifyModal from '../components/VerifyModal';
import { LineChart, Grid } from 'react-native-svg-charts';
import { 
  Zap, 
  Droplets, 
  Plus, 
  History as HistoryIcon, 
  TrendingUp, 
  LogOut, 
  Settings, 
  Trash2, 
  Edit2,
  Lock,
  User,
  Shield,
  Bell
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import ThemeToggle from '../components/ThemeToggle';

const { width } = Dimensions.get('window');

enum ViewMode {
  OVERVIEW = 'overview',
  HISTORY = 'history',
  SETTINGS = 'settings'
}

export default function DashboardScreen() {
  const { 
    user, 
    receipts, 
    isLoading, 
    isDarkMode,
    fetchReceipts, 
    addReceipt, 
    updateReceipt,
    deleteReceipt,
    setUser 
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<UtilityType>(UtilityType.ELECTRIC);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.OVERVIEW);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ExtractedData | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [showVerify, setShowVerify] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<UtilityType | 'all'>('all');
  
  // Settings State
  const [newPassword, setNewPassword] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchReceipts();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigation.navigate('Login');
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setUpdateLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Password updated successfully');
      setNewPassword('');
    }
    setUpdateLoading(false);
  };

  const handleScan = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setIsScanning(true);
      try {
        const text = await performOCR(result.assets[0].uri);
        const parsed = parseReceiptText(text);
        setScannedData({ ...parsed, utilityType: activeTab });
        setShowVerify(true);
      } catch (error) {
        console.error('Scan error:', error);
      } finally {
        setIsScanning(false);
      }
    }
  };

  const handleConfirm = async (data: ExtractedData) => {
    if (!user) return;
    if (editingReceipt) {
      await updateReceipt(editingReceipt.id, {
        total_amount: data.total,
        consumption_kwh: data.consumption,
        billing_date: data.date,
        utility_type: data.utilityType
      });
      setEditingReceipt(null);
    } else {
      await addReceipt({
        total_amount: data.total,
        consumption_kwh: data.consumption,
        billing_date: data.date,
        utility_type: data.utilityType || activeTab,
        user_id: user.id,
        image_url: null
      });
    }
    setShowVerify(false);
  };

  const filteredReceipts = receipts.filter(r => r.utility_type === activeTab);
  const historyReceipts = historyFilter === 'all' ? receipts : receipts.filter(r => r.utility_type === historyFilter);
  
  const totalAmount = filteredReceipts[0]?.total_amount || 0;
  const totalUsage = filteredReceipts[0]?.consumption_kwh || 0;
  
  const chartData = filteredReceipts.slice(0, 6).reverse().map(r => r.consumption_kwh);
  if (chartData.length < 2) chartData.push(0, 0);

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View className={`px-6 py-4 flex-row justify-between items-center border-b ${isDarkMode ? 'border-slate-900' : 'border-slate-200'}`}>
        <View className="flex-row items-center">
          <Image 
            source={require('../../assets/resibo-icon.png')} 
            style={{ width: 32, height: 32 }}
            resizeMode="contain"
          />
          <Text className={`text-2xl font-black ml-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Resibo</Text>
        </View>
        <View className="flex-row items-center space-x-3">
          <ThemeToggle />
          <TouchableOpacity onPress={handleLogout} className={`p-3 rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-white border border-slate-200'}`}>
            <LogOut size={20} color={isDarkMode ? "#94a3b8" : "#64748b"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6">
        
        {/* Navigation Tabs */}
        <View className={`flex-row p-1 rounded-2xl mb-8 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`}>
          <TouchableOpacity 
            onPress={() => setViewMode(ViewMode.OVERVIEW)}
            className={`flex-1 py-3 rounded-xl items-center ${viewMode === ViewMode.OVERVIEW ? 'bg-blue-600' : ''}`}
          >
            <TrendingUp size={18} color={viewMode === ViewMode.OVERVIEW ? '#fff' : '#64748b'} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setViewMode(ViewMode.HISTORY)}
            className={`flex-1 py-3 rounded-xl items-center ${viewMode === ViewMode.HISTORY ? 'bg-blue-600' : ''}`}
          >
            <HistoryIcon size={18} color={viewMode === ViewMode.HISTORY ? '#fff' : '#64748b'} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setViewMode(ViewMode.SETTINGS)}
            className={`flex-1 py-3 rounded-xl items-center ${viewMode === ViewMode.SETTINGS ? 'bg-blue-600' : ''}`}
          >
            <Settings size={18} color={viewMode === ViewMode.SETTINGS ? '#fff' : '#64748b'} />
          </TouchableOpacity>
        </View>

        {viewMode === ViewMode.OVERVIEW && (
          <View className="animate-in fade-in duration-500">
            {/* Utility Tab Selector */}
            <View className={`flex-row p-1.5 rounded-2xl mb-8 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`}>
              <TouchableOpacity 
                onPress={() => setActiveTab(UtilityType.ELECTRIC)}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${activeTab === UtilityType.ELECTRIC ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : ''}`}
              >
                <Zap size={18} color={activeTab === UtilityType.ELECTRIC ? '#fff' : '#64748b'} />
                <Text className={`ml-2 font-bold ${activeTab === UtilityType.ELECTRIC ? 'text-white' : 'text-slate-500'}`}>Electric</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setActiveTab(UtilityType.WATER)}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${activeTab === UtilityType.WATER ? 'bg-teal-600 shadow-lg shadow-teal-500/20' : ''}`}
              >
                <Droplets size={18} color={activeTab === UtilityType.WATER ? '#fff' : '#64748b'} />
                <Text className={`ml-2 font-bold ${activeTab === UtilityType.WATER ? 'text-white' : 'text-slate-500'}`}>Water</Text>
              </TouchableOpacity>
            </View>

            {/* Hero Card */}
            <View className={`p-8 rounded-[40px] mb-8 overflow-hidden relative ${activeTab === UtilityType.ELECTRIC ? 'bg-blue-600 shadow-2xl shadow-blue-900/40' : 'bg-teal-600 shadow-2xl shadow-teal-900/40'}`}>
              <View className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full" />
              <Text className="text-white/80 text-sm font-bold uppercase tracking-widest mb-2">Monthly Bill</Text>
              <Text className="text-white text-5xl font-black mb-8">₱{totalAmount.toLocaleString()}</Text>
              
              <View className="flex-row justify-between items-center pt-6 border-t border-white/20">
                <View>
                  <Text className="text-white/60 text-xs font-bold uppercase mb-1">Consumption</Text>
                  <Text className="text-white text-2xl font-black">{totalUsage.toLocaleString()} {activeTab === UtilityType.ELECTRIC ? 'kWh' : 'm³'}</Text>
                </View>
                <View className="bg-white/20 p-3 rounded-2xl">
                  <TrendingUp size={20} color="#fff" />
                </View>
              </View>
            </View>

            {/* Trends Chart */}
            <View className={`p-8 rounded-[40px] mb-8 ${isDarkMode ? 'bg-slate-900/50 border border-slate-900' : 'bg-white shadow-sm border border-slate-100'}`}>
              <View className="flex-row justify-between items-center mb-6">
                <Text className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Usage Trends</Text>
              </View>
              <View className="h-40">
                <LineChart
                  style={{ flex: 1 }}
                  data={chartData}
                  svg={{ stroke: activeTab === UtilityType.ELECTRIC ? '#3b82f6' : '#14b8a6', strokeWidth: 4 }}
                  contentInset={{ top: 10, bottom: 10 }}
                >
                  <Grid svg={{ stroke: isDarkMode ? '#1e293b' : '#f1f5f9' }} />
                </LineChart>
              </View>
            </View>
          </View>
        )}

        {viewMode === ViewMode.HISTORY && (
          <View className="animate-in fade-in duration-500 mb-20">
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>History</Text>
              <View className={`flex-row p-1 rounded-xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`}>
                <TouchableOpacity onPress={() => setHistoryFilter('all')} className={`px-3 py-1 rounded-lg ${historyFilter === 'all' ? 'bg-blue-600' : ''}`}>
                  <Text className={`text-[10px] font-black ${historyFilter === 'all' ? 'text-white' : 'text-slate-500'}`}>ALL</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setHistoryFilter(UtilityType.ELECTRIC)} className={`px-3 py-1 rounded-lg ${historyFilter === UtilityType.ELECTRIC ? 'bg-blue-600' : ''}`}>
                  <Zap size={10} color={historyFilter === UtilityType.ELECTRIC ? '#fff' : '#64748b'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setHistoryFilter(UtilityType.WATER)} className={`px-3 py-1 rounded-lg ${historyFilter === UtilityType.WATER ? 'bg-teal-600' : ''}`}>
                  <Droplets size={10} color={historyFilter === UtilityType.WATER ? '#fff' : '#64748b'} />
                </TouchableOpacity>
              </View>
            </View>

            {historyReceipts.map(receipt => (
              <View key={receipt.id} className={`p-5 rounded-[28px] mb-4 flex-row justify-between items-center ${isDarkMode ? 'bg-slate-900/50 border border-slate-900' : 'bg-white shadow-sm border border-slate-100'}`}>
                <View className="flex-row items-center">
                  <View className={`p-3 rounded-2xl mr-4 ${receipt.utility_type === UtilityType.ELECTRIC ? 'bg-blue-500/10' : 'bg-teal-500/10'}`}>
                    {receipt.utility_type === UtilityType.ELECTRIC ? <Zap size={20} color="#3b82f6" /> : <Droplets size={20} color="#14b8a6" />}
                  </View>
                  <View>
                    <Text className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{new Date(receipt.billing_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
                    <Text className="text-slate-500 text-xs font-bold mt-1">₱{receipt.total_amount.toLocaleString()}</Text>
                  </View>
                </View>
                <View className="flex-row items-center space-x-2">
                  <TouchableOpacity 
                    onPress={() => {
                      setEditingReceipt(receipt);
                      setScannedData({
                        total: receipt.total_amount,
                        consumption: receipt.consumption_kwh,
                        date: receipt.billing_date,
                        utilityType: receipt.utility_type
                      });
                      setShowVerify(true);
                    }}
                    className="p-2"
                  >
                    <Edit2 size={18} color="#94a3b8" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteReceipt(receipt.id)} className="p-2">
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {viewMode === ViewMode.SETTINGS && (
          <View className="animate-in fade-in duration-500 mb-20">
            <View className={`p-8 rounded-[40px] ${isDarkMode ? 'bg-slate-900/50 border border-slate-900' : 'bg-white shadow-sm border border-slate-100'}`}>
              <View className="flex-row items-center mb-8">
                <View className="w-16 h-16 bg-blue-600 rounded-3xl items-center justify-center">
                  <User size={32} color="#fff" />
                </View>
                <View className="ml-4">
                  <Text className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.email?.split('@')[0]}</Text>
                  <Text className="text-slate-500 font-medium">{user?.email}</Text>
                </View>
              </View>

              <View className={`pt-8 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <View className="flex-row items-center mb-6">
                  <Shield size={20} color="#3b82f6" />
                  <Text className={`ml-3 text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Security</Text>
                </View>
                
                <View className="space-y-4">
                  <View className={`flex-row items-center px-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <Lock size={18} color="#64748b" />
                    <TextInput
                      className={`flex-1 ml-3 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                      placeholder="New Password"
                      placeholderTextColor="#475569"
                      secureTextEntry
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                  </View>
                  <TouchableOpacity 
                    onPress={handleUpdatePassword}
                    disabled={updateLoading}
                    className="bg-slate-900 dark:bg-white py-4 rounded-2xl items-center"
                  >
                    {updateLoading ? <ActivityIndicator /> : <Text className="text-white dark:text-slate-900 font-black">Update Password</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB for Scanning */}
      {viewMode === ViewMode.OVERVIEW && (
        <TouchableOpacity 
          onPress={handleScan}
          disabled={isScanning}
          className="absolute bottom-10 right-8 left-8 h-20 bg-blue-600 rounded-[32px] flex-row items-center justify-center shadow-2xl shadow-blue-500/40"
        >
          {isScanning ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <View className="bg-white/20 p-2 rounded-xl mr-3">
                <Plus size={24} color="#fff" />
              </View>
              <Text className="text-white text-xl font-black">Scan Receipt</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <VerifyModal 
        visible={showVerify} 
        data={scannedData} 
        onConfirm={handleConfirm}
        onCancel={() => {
          setShowVerify(false);
          setEditingReceipt(null);
        }}
      />
    </SafeAreaView>
  );
}
