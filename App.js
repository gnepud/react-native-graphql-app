import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Modal, TextInput } from 'react-native';
import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-boost';
import { ApolloProvider, graphql, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://eu1.prisma.sh/natalia-majkowska/dogs-service/dev',
    headers: {
      authorization:
        'YOUR_TOKEN' // on production you need to store token in storage or in redux persist, for demonstration purposes we do this like that
    }
  }),
  cache: new InMemoryCache()
});

const dogQuery = gql`
  query {
    dogs {
      name
      type
    }
  }
`;

const addDog = gql`
  mutation addDog($type: String!, $name: String!) {
    createDog(data: { type: $type, name: $name }) {
      id
    }
  }
`;

const DogComponent = graphql(dogQuery)(props => {
  const { error, dogs } = props.data;
  if (error) {
    return <Text>{error}</Text>;
  }
  if (dogs) {
    return (
      <View>
        {dogs.map(dog => {
          return <Text key={dog.name}>{dog.name}</Text>;
        })}
      </View>
    );
  }

  return <Text>Loading...</Text>;
});

export default class App extends Component {
  state = {
    modalVisible: false,
    name: '',
    type: ''
  };

  setModalVisible = visible => {
    this.setState({ modalVisible: visible });
  };

  onButtonPress = () => {
    this.setModalVisible(true);
  };

  render() {
    return (
      <ApolloProvider client={client}>
        <View style={styles.container}>
          <Mutation mutation={addDog} refetchQueries={[{ query: dogQuery }]}>
            {(addDogMutation, { data }) => (
              <View>
                <Text style={styles.welcome}>Dogs data:</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={text => this.setState({ name: text })}
                  value={this.state.name}
                  placeholder="name"
                />
                <TextInput
                  style={styles.input}
                  onChangeText={text => this.setState({ type: text })}
                  value={this.state.type}
                  placeholder="type"
                />
                <Button
                  onPress={() => {
                    addDogMutation({
                      variables: {
                        type: this.state.type,
                        name: this.state.name
                      }
                    })
                      .then(res => res)
                      .catch(err => <Text>{err}</Text>);
                    this.setState({ type: '', name: '' });
                  }}
                  title="Add dog"
                />
              </View>
            )}
          </Mutation>
          <Text style={styles.welcome}>My dogs:</Text>
          <DogComponent />
        </View>
      </ApolloProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5
  },
  input: {
    height: 30,
    width: 150,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 5,
    padding: 1
  }
});
