import React, { createContext, useState } from "react";
import { getAllUser, getUser } from "../api/user";
import Toast from 'react-native-root-toast';


export const AppContext = createContext();

const AppContextProvider = (props) => {
    const [userData, setUserData] = useState(null);
    const [allUser, setAllUser] = useState(null);
    const [isFetching, setIsFetching] = useState(false);

    const chnageUserData = (data) => {
        setUserData(data);
        setIsFetching(false);
    };

    const _getUser = (user_id, token, home) => {
        setIsFetching(true);
        getUser(user_id, token).then(res => {
            if (res.data) {
                setUserData(res.data.user)
                setIsFetching(false)
                if (home) {
                    home()
                }
            }
            else {
                setIsFetching(false)
                Toast.show("Something went wrong.", {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.BOTTOM,
                })
            }
        }).catch(err => {
            setIsFetching(false)
            Toast.show(JSON.stringify(err), {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            })
        })
    }

    const _getAlUser = (token) => {
        setIsFetching(true);
        getAllUser(token).then(res => {
            if (res.data) {
                setAllUser(res.data.users)
                setIsFetching(false)
            }
            else {
                setIsFetching(false)
                Toast.show("Something went wrong.", {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.BOTTOM,
                })
            }
        }).catch(err => {
            setIsFetching(false)
            Toast.show(JSON.stringify(err), {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            })
        })
    }

    return (
        <AppContext.Provider
            value={{
                userData,
                chnageUserData,
                isFetching,
                _getUser,
                _getAlUser,
                allUser
            }}
        >
            {props.children}
        </AppContext.Provider>
    );
}

export default AppContextProvider;