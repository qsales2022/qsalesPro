import AnimatedLottieView from 'lottie-react-native';
import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { getHeight, getWidth } from '../../Theme/Constants';

const {width, height} = Dimensions.get('window');

const AnimatedModal = ({visible, onClose, title, children}: any) => {
  const [modalVisible, setModalVisible] = useState(visible);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.3))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      // Start entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Start exit animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.3,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={handleClose}>
      <StatusBar
        backgroundColor="rgba(0, 0, 0, 0.5)"
        barStyle="light-content"
      />

      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, {opacity: fadeAnim}]}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      {/* Modal Content */}
      <View style={styles.centeredView}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: opacityAnim,
              transform: [{scale: scaleAnim}],
            },
          ]}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title || 'Modal Title'}</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Body */}
            <View style={{height:getWidth(1),display:'flex',justifyContent:"center",alignItems:"center"}}>
                <Text style={{color:"black"}}>BIG</Text>
            <AnimatedLottieView
              source={require('../../assets/Animations/sale.json')}
              autoPlay
              loop={true} // Set true if you want infinite animation
              style={styles.animation}
            />

            </View>
            

            {/* Footer */}
            <View style={styles.footer}>
              {/* <TouchableOpacity onPress={handleClose} style={styles.button}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 0,
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  modalContent: {
    borderRadius: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  defaultText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  animation: {
    width: getWidth(1),  // or any fixed value like 300
    height: getWidth(1),
  },
});

export default AnimatedModal;
