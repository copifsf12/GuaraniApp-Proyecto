import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AVATAR_STORAGE_KEY = '@guarani_avatar';
const IS_WEB = Platform.OS === 'web';

export function useImagePicker() {
  const [uploading, setUploading] = useState(false);

  // 📸 Pedir permisos de galería
  const requestGalleryPermission = async () => {
    if (IS_WEB) return true;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos acceso a tu galería para cambiar la foto de perfil.'
      );
      return false;
    }
    return true;
  };

  // 📷 Pedir permisos de cámara
  const requestCameraPermission = async () => {
    if (IS_WEB) return false;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos acceso a tu cámara para tomar una foto.'
      );
      return false;
    }
    return true;
  };

  // 🖼️ Seleccionar de galería/archivos
  const pickFromGallery = async () => {
    try {
      setUploading(true);

      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) {
        setUploading(false);
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        setUploading(false);
        return null;
      }

      const uri = result.assets[0].uri;
      setUploading(false);
      return uri;
    } catch (e) {
      console.warn('Error seleccionando imagen:', e);
      setUploading(false);
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
      return null;
    }
  };

  // 📸 Tomar foto (solo celular)
  const takePhoto = async () => {
    try {
      setUploading(true);

      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        setUploading(false);
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        setUploading(false);
        return null;
      }

      const uri = result.assets[0].uri;
      setUploading(false);
      return uri;
    } catch (e) {
      console.warn('Error tomando foto:', e);
      setUploading(false);
      Alert.alert('Error', 'No se pudo tomar la foto.');
      return null;
    }
  };

  const saveAvatar = async (uri) => {
    try {
      if (uri) {
        await AsyncStorage.setItem(AVATAR_STORAGE_KEY, uri);
      } else {
        await AsyncStorage.removeItem(AVATAR_STORAGE_KEY);
      }
      return true;
    } catch (e) {
      console.warn('Error guardando avatar:', e);
      return false;
    }
  };

  const loadAvatar = async () => {
    try {
      return await AsyncStorage.getItem(AVATAR_STORAGE_KEY);
    } catch (e) {
      console.warn('Error cargando avatar:', e);
      return null;
    }
  };

  const removeAvatar = async () => {
    try {
      await AsyncStorage.removeItem(AVATAR_STORAGE_KEY);
      return true;
    } catch (e) {
      console.warn('Error eliminando avatar:', e);
      return false;
    }
  };

  // 🎯 Opciones según plataforma
  const showPickerOptions = () => {
    return new Promise((resolve) => {
      // ═══════════ WEB ═══════════
      if (IS_WEB) {
        Alert.alert(
          '🖼️ Foto de perfil',
          'Puedes subir una imagen desde tu computadora. Se recortará automáticamente en forma circular.',
          [
            {
              text: '📁 Elegir archivo de mi PC',
              onPress: async () => {
                const uri = await pickFromGallery();
                resolve(uri);
              },
            },
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => resolve(null),
            },
          ],
          { cancelable: true, onDismiss: () => resolve(null) }
        );
        return;
      }

      // ═══════════ CELULAR ═══════════
      Alert.alert(
        '📸 Foto de perfil',
        '¿Cómo quieres elegir tu foto?',
        [
          {
            text: '📷 Tomar foto',
            onPress: async () => {
              const uri = await takePhoto();
              resolve(uri);
            },
          },
          {
            text: '🖼️ Elegir de galería',
            onPress: async () => {
              const uri = await pickFromGallery();
              resolve(uri);
            },
          },
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ],
        { cancelable: true, onDismiss: () => resolve(null) }
      );
    });
  };

  return {
    uploading,
    pickFromGallery,
    takePhoto,
    saveAvatar,
    loadAvatar,
    removeAvatar,
    showPickerOptions,
  };
}

export default useImagePicker;