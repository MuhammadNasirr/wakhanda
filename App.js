import React from 'react';
import Route from './src/route/Route';
import * as Font from "expo-font";
import AppContextProvider from "./src/context";
import { RootSiblingParent } from 'react-native-root-siblings';
import { MenuProvider } from 'react-native-popup-menu';

export default class App extends React.Component {

    render() {
        return (
            <MenuProvider>
                <AppContextProvider>
                    <RootSiblingParent>
                        <Route />
                    </RootSiblingParent>
                </AppContextProvider>
            </MenuProvider>
        );
    }
}

