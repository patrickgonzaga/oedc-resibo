import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ExtractedData, UtilityType } from '../types';
import { X, Check, Calendar, Zap, Droplets, Banknote, Hash } from 'lucide-react-native';
import { useStore } from '../store/useStore';

interface Props {
  visible: boolean;
  data: ExtractedData | null;
  onConfirm: (data: ExtractedData) => void;
  onCancel: () => void;
}

export default function VerifyModal({ visible, data, onConfirm, onCancel }: Props) {
  const [editedData, setEditedData] = useState<ExtractedData | null>(null);
  const { isDarkMode } = useStore();

  useEffect(() => {
    if (data) setEditedData(data);
  }, [data]);

  if (!editedData) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/60"
      >
        <View className={`rounded-t-[40px] p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center mb-8">
            <Text className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Verify Details</Text>
            <TouchableOpacity onPress={onCancel} className="p-2">
              <X size={24} color={isDarkMode ? "#94a3b8" : "#64748b"} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="space-y-6">
            {/* Utility Type Toggle */}
            <View className={`flex-row p-1 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <TouchableOpacity 
                onPress={() => setEditedData({...editedData, utilityType: UtilityType.ELECTRIC})}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${editedData.utilityType === UtilityType.ELECTRIC ? 'bg-blue-600' : ''}`}
              >
                <Zap size={16} color={editedData.utilityType === UtilityType.ELECTRIC ? "#fff" : "#64748b"} />
                <Text className={`ml-2 font-bold ${editedData.utilityType === UtilityType.ELECTRIC ? 'text-white' : 'text-slate-500'}`}>Electric</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setEditedData({...editedData, utilityType: UtilityType.WATER})}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${editedData.utilityType === UtilityType.WATER ? 'bg-teal-600' : ''}`}
              >
                <Droplets size={16} color={editedData.utilityType === UtilityType.WATER ? "#fff" : "#64748b"} />
                <Text className={`ml-2 font-bold ${editedData.utilityType === UtilityType.WATER ? 'text-white' : 'text-slate-500'}`}>Water</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className={`text-xs font-bold uppercase tracking-widest ml-1 mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Billing Date (YYYY-MM-DD)</Text>
                <View className={`flex-row items-center px-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <Calendar size={18} color="#3b82f6" />
                  <TextInput
                    className={`flex-1 ml-3 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                    value={editedData.date}
                    onChangeText={(text) => setEditedData({...editedData, date: text})}
                  />
                </View>
              </View>

              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Text className={`text-xs font-bold uppercase tracking-widest ml-1 mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Usage</Text>
                  <View className={`flex-row items-center px-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <Hash size={18} color="#3b82f6" />
                    <TextInput
                      className={`flex-1 ml-3 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                      value={editedData.consumption.toString()}
                      keyboardType="numeric"
                      onChangeText={(text) => setEditedData({...editedData, consumption: parseFloat(text) || 0})}
                    />
                  </View>
                </View>
                <View className="flex-1">
                  <Text className={`text-xs font-bold uppercase tracking-widest ml-1 mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Total (₱)</Text>
                  <View className={`flex-row items-center px-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <Banknote size={18} color="#3b82f6" />
                    <TextInput
                      className={`flex-1 ml-3 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                      value={editedData.total.toString()}
                      keyboardType="numeric"
                      onChangeText={(text) => setEditedData({...editedData, total: parseFloat(text) || 0})}
                    />
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => onConfirm(editedData)}
              className="bg-blue-600 py-5 rounded-[24px] flex-row items-center justify-center shadow-xl shadow-blue-500/40 mt-6"
            >
              <Check size={20} color="#fff" />
              <Text className="text-white text-xl font-bold ml-2">Confirm & Save</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onCancel}
              className="py-4 items-center mb-10"
            >
              <Text className="text-slate-500 font-bold">Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
