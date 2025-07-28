import React, {useMemo, useCallback} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

type CustomModalProps = {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  onRestart: () => void;
};

const RestartModal: React.FC<CustomModalProps> = ({
  isVisible,
  onClose,
  title = 'Update Available',
  message = 'A new version of the app is available. Would you like to update now?',
  children,
  onRestart,
}) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const modalContent = useMemo(
    () => (
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.modalContainer} onPress={() => {}}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.content}>{children}</View>
          <TouchableOpacity
            onPress={onRestart}
            style={{
              backgroundColor: 'green',
              padding: 10,
              borderRadius: 10,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5, // Android
            }}>
            <Text
              style={{color: 'white', fontWeight: 'bold', textAlign: 'center'}}>
              Update Now
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    ),
    [title, message, children, handleClose],
  );

  return (
    <Modal
      animationType="fade"
      transparent
      visible={isVisible}
      onRequestClose={handleClose}
      statusBarTranslucent>
      {modalContent}
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    paddingTop: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 10,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
  content: {
    marginTop: 8,
  },
});

export default RestartModal;
