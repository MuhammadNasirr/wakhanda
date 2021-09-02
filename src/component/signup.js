import React from 'react';
import { StyleSheet, Text, View, Image, KeyboardAvoidingView, CheckBox, Dimensions, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
const { width: WIDTH } = Dimensions.get('window')
// import { CheckBox } from 'react-native-elements'
import { ScrollView } from 'react-native-gesture-handler';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GradientButton from 'react-native-gradient-buttons';
import * as Facebook from 'expo-facebook';
import * as Google from 'expo-google-app-auth';
import * as AppAuth from 'expo-app-auth';
import { createUser } from '../api/auth';
import Toast from 'react-native-root-toast';
var radio_props = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
];
export default class signup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fname: '',
            lname: '',
            email: '',
            phone: '',
            password: '',
            cpassword: '',
            gender: 'male',
            ischecked: false,
            loading: false
        };
    }


    register = () => {
        this.setState({ loading: true })
        const { fname, lname, email, password, gender } = this.state;
        const body = {
            email: email,
            password: password,
            fullname: fname,
            username: lname,
            gender: gender,
        }
        createUser(body).then(res => {
            if (res.data.user) {
                Toast.show(res.data.msg, { duration: Toast.durations.LONG, position: Toast.positions.BOTTOM })
                this.props.navigation.navigate("login");
            }
            else {
                Toast.show(res.data.msg, { duration: Toast.durations.LONG, position: Toast.positions.BOTTOM })
                this.setState({ loading: false })
            }
        }).catch(err => {
            console.warn('err', err)
            this.setState({ loading: false })
            Toast.show(JSON.stringify(err), { duration: Toast.durations.LONG, position: Toast.positions.BOTTOM })
        })
    }

    renderButton() {
        if (this.state.loading) {
            <View>
            </View>
        }
        return (
            <View style={{ marginTop: 18, marginBottom: -15 }}>
                <ActivityIndicator color="#000000" size={'large'} animating={this.state.loading} />
            </View>
        )
    };

    render() {
        const { ischecked } = this.props
        return (
            <View style={styles.container}>

                <View style={{ marginTop: wp('15%'), padding: 30 }}>
                    <ScrollView showsVerticalScrollIndicator={false}>

                        <Image style={styles.logo} source={require('./../image/signuptext.png')} />

                        <View style={{ marginTop: wp('0%'), alignContent: 'center', alignItems: 'center' }}>
                            <KeyboardAvoidingView behavior="padding">

                                <Text style={{ color: "#88888B", fontSize: 15, marginLeft: wp('8%'), fontWeight: 'bold' }}>FULL NAME</Text>
                                <View style={styles.firstInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={'FULL NAME'}
                                        value={this.state.fname}
                                        onChangeText={fname => this.setState({ fname })}

                                    />
                                </View>

                                <Text style={{ color: "#88888B", fontSize: 15, marginLeft: wp('8%'), fontWeight: 'bold', marginTop: 25 }}>USER NAME</Text>
                                <View style={styles.firstInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={'USER NAME'}
                                        value={this.state.lname}
                                        onChangeText={lname => this.setState({ lname })}

                                    />
                                </View>

                                <Text style={{ color: "#88888B", fontSize: 15, marginLeft: wp('8%'), fontWeight: 'bold', marginTop: wp('6%') }}>EMAIL</Text>
                                <View style={styles.firstInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={'example@email.com'}
                                        value={this.state.email}
                                        onChangeText={email => this.setState({ email })}

                                    />
                                </View>

                                <Text style={{ color: "#88888B", fontSize: 15, marginLeft: wp('8%'), fontWeight: 'bold', marginTop: wp('6%') }}>PASSWORD</Text>
                                <View style={styles.firstInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={'PASSWORD'}
                                        value={this.state.password}
                                        secureTextEntry
                                        onChangeText={password => this.setState({ password })}
                                        keyboardType={'default'}

                                    />
                                </View>

                            </KeyboardAvoidingView>

                            <View style={{ width: '60%', marginLeft: 20, marginTop: wp('5%') }}>
                                <RadioForm
                                    radio_props={radio_props}
                                    initial={0}
                                    formHorizontal={true}
                                    labelHorizontal={true}
                                    onPress={(value) => this.setState({ gender: value })}
                                    buttonSize={0}
                                    buttonOuterSize={20}
                                    style={{ padding: 10 }}
                                    selectedButtonColor={'#DDB937'}
                                    selectedLabelColor={'#DDB937'}
                                    labelStyle={{ marginRight: 10, fontSize: 18 }}
                                />
                            </View>

                            {this.state.loading == false ? null : this.renderButton()}

                            <GradientButton
                                style={{ marginVertical: 8., marginTop: 30, alignSelf: 'center' }}
                                text="Create Account"
                                textStyle={{ fontSize: 17 }}
                                disabled={!this.state.email || !this.state.fname || !this.state.lname || !this.state.password || !this.state.gender}
                                gradientBegin="#DDB937"
                                gradientEnd="#DDB937"
                                gradientDirection="diagonal"
                                height={60}
                                width={280}
                                radius={10}
                                impact
                                impactStyle='Light'
                                onPressAction={() => this.register()}
                            />


                        </View>
                    </ScrollView>
                </View>



                {/* </ImageBackground> */}



                <TouchableOpacity onPress={() => this.props.navigation.navigate('signup')}>
                    <Text style={{ color: 'black', alignSelf: 'center', fontSize: 16, margin: 20 }}>DONT HAVE AN  ACCOUNT? <Text style={{ color: '#EAAA00' }}>SIGNUP</Text></Text>
                </TouchableOpacity>
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
        width: 90,
        height: 30,
        marginBottom: wp('10%')
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
});