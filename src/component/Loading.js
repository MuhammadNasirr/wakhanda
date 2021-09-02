import React from 'react'
import { Modal, ActivityIndicator, View } from 'react-native';


function Loading({ showMe, onClose }) {
    return (
        <Modal
            transparent={true}
            animationType={"fade"}
            visible={showMe}
            onRequestClose={() => onClose()}
        >
            <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ backgroundColor: '#fff', width: 200, height: 200, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size={"large"} color={"#DDB937"} />
                </View>
            </View>
        </Modal>
    )
}

export default Loading;