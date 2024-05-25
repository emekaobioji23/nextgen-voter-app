exports.hash=(val)=>{
    return crypto.createHash(process.env.HASH_ALGORITHM).update(val).digest(process.env.HASH_DIGEST);
}