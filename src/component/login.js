import React, { useContext } from 'react';
import { StyleSheet, CheckBox, Text, View, Image, KeyboardAvoidingView, Dimensions, TouchableOpacity, TextInput, ActivityIndicator, AsyncStorage } from 'react-native';
const { width: WIDTH } = Dimensions.get('window')
import { ScrollView } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GradientButton from 'react-native-gradient-buttons';
import * as Facebook from 'expo-facebook';
import * as Google from 'expo-google-app-auth';
import * as AppAuth from 'expo-app-auth';
import { StreamApp } from 'expo-activity-feed';
import { loginUser } from '../api/auth';
import { AppContext } from '../context';
import Toast from 'react-native-root-toast';

export default class login extends React.Component {
    static contextType = AppContext
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            loading: false,
            isRemember: false,
        };
    }

    async componentDidMount() {
        const creds = await AsyncStorage.getItem("creds")
        if (creds) {
            this.setState({
                email: JSON.parse(creds).email,
                password: JSON.parse(creds).password,
                isRemember: true,
            })
        }
    }

    login = () => {
        const { chnageUserData } = this.context

        const { email, password, isRemember } = this.state;
        if (email == '') {

            alert("Please Enter Your Email");
            return;
        }
        else {
            this.setState({ loading: true });
        }
        const body = {
            email: email,
            password: password
        }

        loginUser(body).then(res => {
            if (res.data) {
                if (isRemember) {
                    AsyncStorage.setItem('creds', JSON.stringify(body));
                } else {
                    AsyncStorage.removeItem('creds');
                }
                AsyncStorage.setItem('UID', res.data.user._id);
                AsyncStorage.setItem('token', res.data.access_token);
                chnageUserData(res.data.user)
                Toast.show(res.data.msg, {
                    duration: Toast.durations.SHORT,
                    position: Toast.positions.BOTTOM,
                })
                this.setState({ loading: false })
                this.props.navigation.navigate('home2');
            }
            else {
                this.setState({ loading: false })
                Toast.show("Something went wrong!", {
                    duration: Toast.durations.SHORT,
                    position: Toast.positions.BOTTOM,
                })
            }
        }).catch(err => {
            console.log(err)
            this.setState({ loading: false })
            Toast.show("Invalid email or password!", {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
            })
        })
    }

    renderButton() {
        if (this.state.loading) {
            <View>
            </View>
        }
        return (
            <View style={{ marginTop: -10, marginBottom: 10 }}>
                <ActivityIndicator color="#000000" size={'large'} animating={this.state.loading} />
            </View>
        )
    };

    render() {
        return (
            <View style={styles.container}>
                <View style={{ marginTop: wp('10%'), padding: 30 }}>
                    <ScrollView>

                        <Image style={styles.logo} source={require('./../image/logo.png')} />

                        <Image style={styles.logintext} source={require('./../image/logintext.jpg')} />

                        <View style={{ marginTop: wp('0%'), alignContent: 'center', alignItems: 'center' }}>
                            <KeyboardAvoidingView behavior="padding">

                                <Text style={{ color: "#88888B", fontSize: 15, marginLeft: wp('8%'), fontWeight: 'bold' }}>EMAIL</Text>
                                <View style={styles.firstInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={'Email'}
                                        value={this.state.email}
                                        onChangeText={email => this.setState({ email })}
                                    />
                                </View>

                                <Text style={{ color: "#88888B", fontSize: 15, marginLeft: wp('8%'), fontWeight: 'bold', marginTop: 20 }}>PASSWORD</Text>
                                <View style={styles.firstInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={'Password'}
                                        value={this.state.password}
                                        onChangeText={password => this.setState({ password })}
                                        secureTextEntry={true}
                                    />
                                </View>

                            </KeyboardAvoidingView>

                            <View style={{
                                flexDirection: "row",
                                justifyContent: 'space-between',
                                width: '95%',
                                marginBottom: wp('5%'),
                                marginTop: wp('5%'),
                            }}>


                                <View style={{
                                    flexDirection: "row",
                                    justifyContent: 'flex-start',
                                    marginTop: -7
                                }}>
                                    <CheckBox
                                        value={this.state.isRemember}
                                        onValueChange={isRemember => this.setState({ isRemember })}
                                        style={{ alignSelf: "center", }}
                                    />
                                    <Text style={{ margin: 8 }}>Remember your password?</Text>
                                </View>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('resetPassword')}>
                                    <Text style={{ color: 'black', textAlign: 'right', width: '100%' }}>Forgot password?</Text>
                                </TouchableOpacity>
                            </View>

                            {this.state.loading == false ? null : this.renderButton()}

                            <GradientButton
                                style={{ marginVertical: 8., marginTop: 0, alignSelf: 'center' }}
                                text="Sign in"
                                textStyle={{ fontSize: 17 }}
                                disabled={!this.state.email || !this.state.password}
                                gradientBegin="#DDB937"
                                gradientEnd="#DDB937"
                                gradientDirection="diagonal"
                                height={60}
                                width={280}
                                radius={10}
                                impact
                                impactStyle='Light'
                                onPressAction={() => this.login()}
                            />

                            <TouchableOpacity onPress={() => this.props.navigation.navigate('signup')}>
                                <Text style={{ color: 'black', alignSelf: 'center', fontSize: 15, marginTop: wp('5%') }}>Don't have an account? <Text style={{ color: '#DDB937', fontWeight: 'bold' }}>Sign up</Text></Text>
                            </TouchableOpacity>


                        </View>
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
    logo: {
        width: 150,
        height: 70,
        marginBottom: wp('10%')
    },
    logintext: {
        width: 300,
        height: 130,
        marginBottom: wp('10%'),
        marginTop: wp('0%'),
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
    secondInput: {
        flexDirection: 'row',
        marginBottom: 30,
        marginTop: 40,
        borderBottomColor: '#EAEAEAEA',
        borderBottomWidth: 1,
        marginHorizontal: 25
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
});