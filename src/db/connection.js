import mongoose from 'mongoose'; // подключаем СУБД

const mongoDB = `mongodb+srv://rarus:rarus_pass@cluster0-u5fuk.mongodb.net/test?retryWrites=true&w=majority`;

console.log(mongoDB);

export default mongoose.createConnection(mongoDB, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true } ); // подключаемся к монге
