const pool = require("../connection/database");

const CreateUser = async (req,res)=>{
    try {
        const { User_Name, EMAIL } = req.body;
        const user = await pool.query(
      "INSERT INTO User_Entity (User_Name, EMAIL) VALUES ($1, $2) RETURNING *",
      [User_Name, EMAIL]
    );

    return res.status(201).json({
      success: true,
      data: user.rows[0],
      error: null,
    });
    } catch (error) {
        console.log(`error in creating user ${error.message}`)
        return res.status(500).json({
            success : false,
            data : null,
            error :error.message
        })
    }
}

module.exports = CreateUser;