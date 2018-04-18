module.exports = {
    
    showDashboard(req, res) {
        res.render("dashboard.ejs", {
        	user : req.user 
        });
    }
};

