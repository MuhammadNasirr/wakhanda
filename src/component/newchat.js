
import React from 'react';
import { StyleSheet, Text, View, Image, TextInput, Dimensions, TouchableOpacity, FlatList, AsyncStorage, Alert, Picker } from 'react-native';
const { width: WIDTH } = Dimensions.get('window')
import { ScrollView } from 'react-native-gesture-handler';
import { Fab } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AddIcon from '../image/icon/plus.png';
import moment from 'moment';
import { AppContext } from '../context';

export default class newchat extends React.Component {
    static contextType = AppContext
    constructor(props) {
        super(props);
        this.state = {
            phone: '',
            searchUser: false,
            searchText: '',
            chat: [],
            users: [],
        };
    }

    async componentDidMount() {
        const { userData } = this.context
        const UID = await AsyncStorage.getItem('UID');
        this.setState({ UID: UID })
        if (userData) {
            console.warn(userData?.friends);
            this.setState({ chat: userData?.friends })
        }
    }

    renderChat = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => this.props.navigation.navigate('conversation', { user: item })} style={{ marginTop: wp('7%'), alignContent: 'center', alignItems: 'center', paddingLeft: 15, paddingRight: 15, borderBottomColor: '#EAEAEA', borderBottomWidth: 1, paddingBottom: 10 }}>

                <View style={{ flexDirection: 'row' }}>
                    <View style={{ width: '25%' }}>
                        <Image style={styles.profile} source={{ uri: item.avatar }} />
                    </View>
                    <View style={{ width: '60%', marginLeft: 10, }}>
                        <Text style={{ fontSize: 15, color: '#DDB937', fontWeight: 'bold', textTransform: 'capitalize' }}>{item?.fullname}</Text>
                        <View style={{ flexDirection: 'row', marginTop: 3, marginLeft: -5 }}>
                        </View>
                    </View>
                </View>

            </TouchableOpacity>
        )
    }

    render() {
        return (
            <View style={styles.container}>

                <View style={{ marginTop: wp('10%') }}>
                    <ScrollView showsVerticalScrollIndicator={false}>

                        <View style={{ flexDirection: 'row', padding: 30 }}>
                            <TouchableOpacity style={{ width: 50, marginTop: 6 }} onPress={() => this.props.navigation.goBack(null)}>
                                <Image style={styles.back} source={require('./../image/icon/back.png')} />
                            </TouchableOpacity>
                            <View style={{ width: this.state.searchUser ? '20%' : '50%' }}>
                                <Text style={{ fontSize: 30, fontWeight: "bold" }}>Select Friend</Text>
                            </View>

                        </View>

                        <FlatList
                            data={this.state.users.length > 0 ? this.state.users : this.state.chat}
                            renderItem={this.renderChat}
                            keyExtractor={item => item.id}
                        />
                    </ScrollView>
                </View>
            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    profile: {
        width: 65,
        height: 65,
        marginTop: 0,
        marginLeft: 20,
        borderRadius: 300
    },
    back: {
        width: 30,
        height: 30,
        marginBottom: wp('10%')
    },
});