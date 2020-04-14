const mongoose = require('mongoose');
const { Schema } = mongoose;

// Book 에서 사용할 서브다큐먼트의 스키마입니다.
// const Author = new Schema({
//     name: String,
//     email: String
// });

const Book = new Schema({
    title: String,
    authors: [{
        name: String,
        email: String
    }], 
    publishedDate: Date,
    price: Number,
    tags: [String],
    createdAt: { 
        type: Date,
        default: Date.now()
    }
});

// 스키마를 모델로 변환하여, 내보내기 합니다.
module.exports = mongoose.model('Book', Book);