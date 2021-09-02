
import React from 'react';
import { StyleSheet, Text, View, Image, TextInput, Dimensions, TouchableOpacity, FlatList, AsyncStorage, Alert, Picker } from 'react-native';
const { width: WIDTH } = Dimensions.get('window')
import { ScrollView } from 'react-native-gesture-handler';
import { Fab } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { searchUser } from '../api/user';
import AddIcon from '../image/icon/plus.png';
import Toast from 'react-native-root-toast';
import { getConversations } from '../api/messages';
import moment from 'moment';

var radio_props = [
    { value: 'Public', label: 'Public' },
    { value: 'Private', label: 'Private' },
];
export default class chatlist extends React.Component {
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
        const UID = await AsyncStorage.getItem('UID');
        this.setState({ UID: UID })
        this.props.navigation.addListener('didFocus', () => {
            this._getConversations()
        });
        this._getConversations()
    }

    _searchUser = async (e) => {
        this.setState({ searchText: e })
        try {
            if (e) {
                const token = await AsyncStorage.getItem('token');
                const UID = await AsyncStorage.getItem('UID');
                if (token == '') {
                    alert("Please Login First!");
                    return;
                }
                const res = await searchUser(e.toLowerCase(), token)
                this.setState({ users: this.removeMyData(res.data.users, UID) })
            }
            else {
                this.setState({ users: [] })

            }
        } catch (error) {
            console.log(error)
            Toast.show("Something went wrong.", {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            })
        }

    }

    _getConversations = async (e) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token == '') {
                alert("Please Login First!");
                return;
            }
            const res = await getConversations(9, token)
            console.warn('res.data.conversations', res.data.conversations);
            this.setState({ chat: res.data.conversations })
        } catch (error) {
            console.log(error)
            Toast.show("Something went wrong.", {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            })
        }

    }

    removeMyData = (users, id) => {
        return users?.filter(e => e._id !== id)
    }

    checkUser = (data) => {
        let filterd = data?.filter(e => e._id !== this.state.UID)
        filterd =  filterd[0]
        return filterd
    }

    renderChat = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => this.props.navigation.navigate('conversation', { user: item?.recipients?.length > 0 ? this.checkUser(item?.recipients) : item })} style={{ marginTop: wp('7%'), alignContent: 'center', alignItems: 'center', paddingLeft: 15, paddingRight: 15, borderBottomColor: '#EAEAEA', borderBottomWidth: 1, paddingBottom: 10 }}>

                <View style={{ flexDirection: 'row' }}>
                    <View style={{ width: '25%' }}>
                        <Image style={styles.profile} source={{ uri: this.checkUser(item?.recipients).avatar }} />
                    </View>
                    <View style={{ width: '60%', marginLeft: 10, }}>
                        <Text style={{ fontSize: 15, color: '#DDB937', fontWeight: 'bold', textTransform: 'capitalize' }}>{item?.fullname ? item?.fullname : this.checkUser(item?.recipients).username}</Text>
                        <View style={{ flexDirection: 'row', marginTop: 3, marginLeft: -5 }}>
                            <View style={{ width: '100%' }}>
                                <Text style={{ marginTop: 0, color: '#8f92a1', marginLeft: 5 }}>{item?.text}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ width: '20%' }}>
                        <Text style={{ fontSize: 12, marginTop: 25 }}>{item?.updatedAt ? moment(item?.updatedAt).fromNow() : ''}</Text>
                    </View>
                </View>

            </TouchableOpacity>
        )
    }

    render() {
        console.warn('this.state.chat',this.state.chat);
        return (
            <View style={styles.container}>

                <View style={{ marginTop: wp('10%') }}>
                    <ScrollView showsVerticalScrollIndicator={false}>

                        <View style={{ flexDirection: 'row', padding: 30 }}>
                            <View style={{ width: this.state.searchUser ? '20%' : '50%' }}>
                                <Text style={{ fontSize: 30, fontWeight: "bold" }}>Chat</Text>
                            </View>
                            {
                                this.state.searchUser ? <View style={[styles.firstInput, { marginTop: -5, marginBottom: 43 }]}>
                                    <TextInput
                                        style={[styles.input, { width: '80%' }]}
                                        placeholder={'Search...'}
                                        // onBlur={() => this.setState({ users: [] })}
                                        onChangeText={(e) => this._searchUser(e)}
                                        value={this.state.searchText}
                                    />
                                </View> :
                                    <>
                                        <View style={{ width: '10%', marginLeft: 10, marginRight: 10 }}>
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('creategroup')}>
                                                <Image style={styles.search} source={require('./../image/icon/plus.png')} />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ width: '10%', marginLeft: 10, marginRight: 10 }}>
                                            <TouchableOpacity>
                                                <Image style={styles.search} source={require('./../image/icon/setting.png')} />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ width: '10%', marginLeft: 10, marginRight: 10 }}>
                                            <TouchableOpacity onPress={() => this.setState({ searchUser: true })}>
                                                <Image style={styles.search} source={require('./../image/icon/search.png')} />
                                            </TouchableOpacity>
                                        </View>
                                    </>
                            }
                        </View>

                        <View style={{ flexDirection: 'row', padding: 20, marginTop: -40, paddingBottom: 0, marginBottom: 20, borderBottomColor: '#EAEAEA', borderBottomWidth: 1 }}>

                            <TouchableOpacity style={{ width: '33%' }}>
                                <Text style={{ alignSelf: 'center', fontSize: 17, marginTop: 0, fontWeight: 'bold', paddingBottom: 10, color: '#DDB937' }}>CHATS</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ width: '33%' }}>
                                <Text style={{ alignSelf: 'center', fontSize: 17, marginTop: 0, paddingBottom: 10, color: '#999999' }}>WAK'S</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ width: '33%' }}>
                                <Text style={{ alignSelf: 'center', fontSize: 17, marginTop: 0, paddingBottom: 10, color: '#999999' }}>CALLS</Text>
                            </TouchableOpacity>

                        </View>


                        <FlatList
                            data={this.state.users.length > 0 ? this.state.users : this.state.chat}
                            renderItem={this.renderChat}
                            keyExtractor={item => item.id}
                        />



                    </ScrollView>
                </View>
                    <Fab
                        containerStyle={{}}
                        style={{ backgroundColor: 'lightgrey' }}
                        position="bottomRight"
                       >
                       <TouchableOpacity  onPress={() => this.props.navigation.navigate('newchat')}>
                        <Image source={AddIcon} style={{ width: 60, height: 60 }} />
                       </TouchableOpacity>
                    </Fab>
            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    logo: {
        width: 180,
        height: 20,
        marginBottom: wp('10%'),
        marginTop: 12
    },
    imgpicker: {
        width: 290,
        height: 130,
        alignSelf: 'center',
        marginTop: 20
    },
    search: {
        width: 40,
        height: 40,
        marginBottom: wp('10%')
    },
    back: {
        width: 30,
        height: 30,
        marginBottom: wp('5%'),
        marginLeft: 20,
        marginTop: 10
    },
    icon: {
        width: 40,
        height: 40,
        marginBottom: wp('10%'),
        margin: 10
    },
    block: {
        margin: 5,
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
        borderRadius: 10,
        padding: 10
    },
    profile: {
        width: 65,
        height: 65,
        marginTop: 0,
        marginLeft: 20,
        borderRadius: 300
    },
    dot: {
        width: 25,
        height: 10,
        marginTop: wp('2%'),
        marginLeft: 5
    },
    commentimg: {
        width: 30,
        height: 30,
        // marginBottom: wp('10%')
    },
    logintext: {
        width: 300,
        height: 130,
        marginBottom: wp('10%'),
        marginTop: wp('10%'),
    },
    headerText: {
        fontSize: 30,
        color: 'white',
        alignSelf: 'center',
    },
    button: {
        marginTop: hp('3%'),
        alignItems: 'center',
        backgroundColor: '#E0C800',
        borderRadius: wp('2%'),
        height: 40,
        marginHorizontal: wp('13%'),
    },
    buttonText: {

        fontSize: 20,
        color: '#000',
        marginTop: hp('1%'),
    },
    signupView: {
        alignItems: 'center',
        marginTop: hp('35%')
    },
    alresdy: {
        fontSize: hp('2.5%'),
        color: '#666666'
    },
    signupText: {
        fontSize: hp('2.5%'),
        marginTop: hp('1%'),
        color: '#00cb9c',
        fontWeight: 'bold'
    },
    firstInput: {
        flexDirection: 'row',
        marginTop: 10,
        marginHorizontal: 25,
        backgroundColor: '#f4f4f4',
        borderRadius: 10,
        padding: 5
    },
    firstInput1: {
        flexDirection: 'row',
        marginTop: 10,
        marginHorizontal: 25,
        backgroundColor: '#f4f4f4',
        borderRadius: 10,
        padding: 5
    },
    secondInput: {
        flexDirection: 'row',
        marginBottom: 30,
        marginTop: 40,
        borderBottomColor: '#EAEAEAEA',
        borderBottomWidth: 1,
        marginHorizontal: 25
    },
    checkboxcontainer: {
        flexDirection: "row",
        marginTop: wp('5%'),
        marginLeft: wp('5%')
    },
    checkbox: {
        alignSelf: "center",
    },
    input: {
        width: WIDTH - 85,
        height: 40,
        padding: 10,
        marginBottom: 0,
        backgroundColor: 'transparent',
        color: 'black',
        fontSize: 15
    },
    input1: {
        width: WIDTH - 85,
        height: 120,
        padding: 10,
        marginBottom: 0,
        backgroundColor: 'transparent',
        color: 'black',
        fontSize: 15
    },
});