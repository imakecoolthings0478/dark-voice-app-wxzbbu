
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, RefreshControl } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { shadows } from '../styles/commonStyles';
import Icon from './Icon';
import { DesignRequest, GlobalMessage } from '../types';
import { supabaseService } from '../services/supabaseService';
import { AdminService } from '../services/adminService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminRequestsPanel() {
  const { colors } = useTheme();
  const [requests, setRequests] = useState<DesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showGlobalMessageForm, setShowGlobalMessageForm] = useState(false);
  const [globalMessageTitle, setGlobalMessageTitle] = useState('');
  const [globalMessageText, setGlobalMessageText] = useState('');
  const [globalMessageType, setGlobalMessageType] = useState<GlobalMessage['type']>('info');

  useEffect(() => {
    loadRequests();
    // Extend admin session when panel is accessed
    AdminService.extendSession();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // Try to load from Supabase first
      if (supabaseService.isReady()) {
        const result = await supabaseService.getRequests();
        if (result.success && result.data) {
          setRequests(result.data);
          console.log('Loaded requests from Supabase:', result.data.length);
          return;
        }
      }

      // Fallback to local storage
      const savedRequests = await AsyncStorage.getItem('design_requests');
      if (savedRequests) {
        const localRequests = JSON.parse(savedRequests);
        setRequests(localRequests);
        console.log('Loaded requests from local storage:', localRequests.length);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      Alert.alert('Error', 'Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const updateRequestStatus = async (
    requestId: string, 
    newStatus: DesignRequest['status'], 
    adminNotes?: string
  ) => {
    try {
      // Update in cloud first
      if (supabaseService.isReady()) {
        const result = await supabaseService.updateRequestStatus(requestId, newStatus, adminNotes);
        if (result.success) {
          console.log('✅ Request updated in cloud');
        } else {
          console.log('❌ Failed to update in cloud:', result.error);
        }
      }

      // Update locally
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: newStatus, 
              updated_at: new Date().toISOString(),
              admin_notes: adminNotes || req.admin_notes
            } 
          : req
      );
      
      setRequests(updatedRequests);
      await AsyncStorage.setItem('design_requests', JSON.stringify(updatedRequests));
      
      const statusText = newStatus === 'accepted' ? 'accepted' : 
                        newStatus === 'rejected' ? 'rejected' : newStatus;
      
      Alert.alert('Success', `Request ${requestId} has been ${statusText}`);
      console.log(`Request ${requestId} status updated to ${newStatus}`);
      
      // Extend admin session
      AdminService.extendSession();
    } catch (error) {
      console.error('Error updating request status:', error);
      Alert.alert('Error', 'Failed to update request status');
    }
  };

  const handleAcceptRequest = (request: DesignRequest) => {
    Alert.alert(
      'Accept Request',
      `Accept the ${request.service_type} request from ${request.client_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          style: 'default',
          onPress: () => updateRequestStatus(request.id, 'accepted', 'Request accepted by admin')
        }
      ]
    );
  };

  const handleRejectRequest = (request: DesignRequest) => {
    Alert.prompt(
      'Reject Request',
      `Provide a reason for rejecting ${request.client_name}'s request:`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: (reason) => {
            const adminNotes = reason || 'Request rejected by admin';
            updateRequestStatus(request.id, 'rejected', adminNotes);
          }
        }
      ],
      'plain-text',
      'Please provide a brief explanation...'
    );
  };

  const createGlobalMessage = async () => {
    if (!globalMessageTitle.trim() || !globalMessageText.trim()) {
      Alert.alert('Error', 'Please fill in both title and message');
      return;
    }

    const message: GlobalMessage = {
      id: `MSG-${Date.now()}`,
      title: globalMessageTitle.trim(),
      message: globalMessageText.trim(),
      type: globalMessageType,
      created_at: new Date().toISOString(),
      is_active: true,
    };

    try {
      if (supabaseService.isReady()) {
        const result = await supabaseService.createGlobalMessage(message);
        if (result.success) {
          Alert.alert('Success', 'Global message created successfully!');
          setGlobalMessageTitle('');
          setGlobalMessageText('');
          setShowGlobalMessageForm(false);
          return;
        }
      }

      // Fallback to local storage
      const existingMessages
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, RefreshControl } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { shadows } from '../styles/commonStyles';
import Icon from './Icon';
import { DesignRequest, GlobalMessage } from '../types';
import { supabaseService } from '../services/supabaseService';
import { AdminService } from '../services/adminService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminRequestsPanel() {
  const { colors } = useTheme();
  const [requests, setRequests] = useState<DesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showGlobalMessageForm, setShowGlobalMessageForm] = useState(false);
  const [globalMessageTitle, setGlobalMessageTitle] = useState('');
  const [globalMessageText, setGlobalMessageText] = useState('');
  const [globalMessageType, setGlobalMessageType] = useState<GlobalMessage['type']>('info');

  useEffect(() => {
    loadRequests();
    // Extend admin session when panel is accessed
    AdminService.extendSession();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // Try to load from Supabase first
      if (supabaseService.isReady()) {
        const result = await supabaseService.getRequests();
        if (result.success && result.data) {
          setRequests(result.data);
          console.log('Loaded requests from Supabase:', result.data.length);
          return;
        }
      }

      // Fallback to local storage
      const savedRequests = await AsyncStorage.getItem('design_requests');
      if (savedRequests) {
        const localRequests = JSON.parse(savedRequests);
        setRequests(localRequests);
        console.log('Loaded requests from local storage:', localRequests.length);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      Alert.alert('Error', 'Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const updateRequestStatus = async (
    requestId: string, 
    newStatus: DesignRequest['status'], 
    adminNotes?: string
  ) => {
    try {
      // Update in cloud first
      if (supabaseService.isReady()) {
        const result = await supabaseService.updateRequestStatus(requestId, newStatus, adminNotes);
        if (result.success) {
          console.log('✅ Request updated in cloud');
        } else {
          console.log('❌ Failed to update in cloud:', result.error);
        }
      }

      // Update locally
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: newStatus, 
              updated_at: new Date().toISOString(),
              admin_notes: adminNotes || req.admin_notes
            } 
          : req
      );
      
      setRequests(updatedRequests);
      await AsyncStorage.setItem('design_requests', JSON.stringify(updatedRequests));
      
      const statusText = newStatus === 'accepted' ? 'accepted' : 
                        newStatus === 'rejected' ? 'rejected' : newStatus;
      
      Alert.alert('Success', `Request ${requestId} has been ${statusText}`);
      console.log(`Request ${requestId} status updated to ${newStatus}`);
      
      // Extend admin session
      AdminService.extendSession();
    } catch (error) {
      console.error('Error updating request status:', error);
      Alert.alert('Error', 'Failed to update request status');
    }
  };

  const handleAcceptRequest = (request: DesignRequest) => {
    Alert.alert(
      'Accept Request',
      `Accept the ${request.service_type} request from ${request.client_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          style: 'default',
          onPress: () => updateRequestStatus(request.id, 'accepted', 'Request accepted by admin')
        }
      ]
    );
  };

  const handleRejectRequest = (request: DesignRequest) => {
    Alert.prompt(
      'Reject Request',
      `Provide a reason for rejecting ${request.client_name}'s request:`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: (reason) => {
            const adminNotes = reason || 'Request rejected by admin';
            updateRequestStatus(request.id, 'rejected', adminNotes);
          }
        }
      ],
      'plain-text',
      'Please provide a brief explanation...'
    );
  };

  const createGlobalMessage = async () => {
    if (!globalMessageTitle.trim() || !globalMessageText.trim()) {
      Alert.alert('Error', 'Please fill in both title and message');
      return;
    }

    const message: GlobalMessage = {
      id: `MSG-${Date.now()}`,
      title: globalMessageTitle.trim(),
      message: globalMessageText.trim(),
      type: globalMessageType,
      created_at: new Date().toISOString(),
      is_active: true,
    };

    try {
      if (supabaseService.isReady()) {
        const result = await supabaseService.createGlobalMessage(message);
        if (result.success) {
          Alert.alert('Success', 'Global message created successfully!');
          setGlobalMessageTitle('');
          setGlobalMessageText('');
          setShowGlobalMessageForm(false);
          return;
        }
      }

      // Fallback to local storage
      const existingMessages