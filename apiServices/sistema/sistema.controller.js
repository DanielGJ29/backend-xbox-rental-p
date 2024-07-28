//util
const { catchAsync } = require("../../util/catchAsync");

//Models
const { Role } = require("./sistema.model");

//Utils
const { AppError } = require("../../util/appError");

//?GET ALL ROLES
exports.getAllRole = catchAsync(async (req, res, next) => {
  const roles = await Role.findAll({
    where: { status: "active" },
  });

  res.status(200).json({ status: "success", data: roles });
});

//?NEW ROLE
exports.newRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;

  const roles = await Role.findOne({
    where: { role },
  });

  console.log("ROLES", roles);

  if (roles) {
    console.log("entro a role");
    return next(
      new AppError(
        404,
        `The role: ${role} is already registered with ID ${roles.id}`
      )
    );
  }

  //Query create
  const newRole = await Role.create({
    role,
  });

  if (!newRole) {
    res.status(400).json({ status: "fail" });
    return;
  }

  res.status(200).json({ status: "success", data: newRole });
});

//?Menu
exports.getAllRutas = catchAsync(async (req, res) => {
  console.log("req", req.currentUser.role);
  const role = req.currentUser.role;
  const rutas =
    role === "admin"
      ? [
          {
            name: "Inicio",
            icon: "DashboardIcon",
            url: "/dashboard",
            children: [],
          },
          {
            name: "Renta",
            icon: "HandshakeIcon",
            url: "/renta",
            children: [],
          },
          {
            name: "Devoluciones",
            icon: "BallotIcon",
            url: "/devoluciones",
            children: [],
          },
          {
            name: "consolas",
            icon: "VideogameAssetIcon",
            url: "/consoles",
            children: [
              {
                name: "modelos",
                icon: "",
                url: "/consoles/modelos",
                children: [],
              },
              {
                name: "nombres",
                icon: "",
                url: "/consoles/names",
                children: [],
              },
              {
                name: "consolas",
                icon: "",
                url: "/consoles/consolas",
                children: [],
              },
              {
                name: "controles",
                icon: "",
                url: "/consoles/controles",
                children: [],
              },
              {
                name: "accesorios",
                icon: "HeadphonesIcon",
                url: "/consoles/accesorios",
                children: [],
              },
            ],
          },
          {
            name: "clientes",
            icon: "PeopleAltIcon",
            url: "/clientes",
            children: [],
          },
          {
            name: "sistema",
            icon: "SettingsSuggestIcon",
            url: "/sistema",
            children: [
              {
                name: "usuarios",
                icon: "",
                url: "/sistema/user",
                children: [],
              },
              { name: "roles", icon: "", url: "/rol", children: [] },
            ],
          },
        ]
      : [
          {
            name: "Inicio",
            icon: "DashboardIcon",
            url: "/dashboard",
            children: [],
          },
          {
            name: "Renta",
            icon: "HandshakeIcon",
            url: "/renta",
            children: [],
          },
          {
            name: "Devoluciones",
            icon: "BallotIcon",
            url: "/devoluciones",
            children: [],
          },
          {
            name: "consolas",
            icon: "VideogameAssetIcon",
            url: "/consoles",
            children: [
              // {
              //   name: "modelos",
              //   icon: "",
              //   url: "/consoles/modelos",
              //   children: [],
              // },
              // {
              //   name: "nombres",
              //   icon: "",
              //   url: "/consoles/names",
              //   children: [],
              // },
              {
                name: "consolas",
                icon: "",
                url: "/consoles/consolas",
                children: [],
              },
              {
                name: "controles",
                icon: "",
                url: "/consoles/controles",
                children: [],
              },
              {
                name: "accesorios",
                icon: "HeadphonesIcon",
                url: "/consoles/accesorios",
                children: [],
              },
            ],
          },
          {
            name: "clientes",
            icon: "PeopleAltIcon",
            url: "/clientes",
            children: [],
          },
        ];

  res.status(200).json({ status: "success", data: rutas });
});
