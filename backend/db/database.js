const mongoose = require('mongoose');
/**
 * @class DataBase
 */
class DataBase {

    /**
     * 
     * @param {Schema} Schema mongoose Schema 
     * @param {Object} insert_data object to save
     * @returns Promise <Boolean> - true for saved, false for existing user
     */
    static saveUser(schema, insert_data){
        return new Promise((resolve, reject)=>{

            //check for existing user.
            this.findOne(schema, {email: insert_data.email})
            .then(data=>{

                //user exists
                if(data) return resolve(false);
                //user doesnot exists, save in database.
                new schema(insert_data).save(err=>{
                    if(err) return reject(err);
                    resolve(true);
                });

            }).catch(err=> reject(err));

        });
    }

    /**
     * 
     * @param {Schema} schema - Mongoose Schema
     * @param {Object} filter - Filter
     * @reaturns {Promise} Data
     */

    static findOne(schema, filter){
        return new Promise((resolve, reject)=>{
            schema.findOne(filter, (err, data)=>{
                if(err) return reject(err);
                resolve(data);
            });
        });
    }
}

module.exports = DataBase;