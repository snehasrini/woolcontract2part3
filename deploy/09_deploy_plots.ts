import { deployments } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployStateMachineSystem } from '../_helpers/provenance/statemachine';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

type GeoPosition = number[];
type polygonPositions = GeoPosition[][];

interface IPlot {
  entity: string;
  recId: string;
  capaKey: string;
  type: string;
  caSeKey: string;
  fiscSitId: string;
  updDate: string;
  shape_area: number;
  owner: string;
  geo: {
    type: string;
    coordinates: polygonPositions;
  };
}

const DUMMY_DATA = [
  {
    entity: 'Bpn_CaPa',
    recId: '1',
    capaKey: '23021B0002/00D002',
    type: 'PR',
    caSeKey: '23021B',
    fiscSitId: '1',
    updDate: '1558051200',
    shape_area: 42,
    owner: '0xD829132766185320Ed1BAb6571BE544eacf6f918',
    geo: {
      type: 'Polygon',
      coordinates: [
        [
          [4.12440969135012, 50.9057811318218],
          [4.12462145633197, 50.9056224234825],
          [4.12464998117825, 50.9056378994515],
          [4.12472029948789, 50.9056760605046],
          [4.12534528139214, 50.9060135039193],
          [4.12514194036533, 50.9061569328008],
          [4.12457311182103, 50.9058647675547],
          [4.12440969135012, 50.9057811318218],
        ],
      ],
    },
  },
  {
    entity: 'Bpn_CaPa',
    recId: '2',
    capaKey: '23021B0002/00A002',
    type: 'PR',
    caSeKey: '23021B',
    fiscSitId: '1',
    updDate: '1558051200',
    shape_area: 83,
    owner: '0x0f803d6AfDdE719f2b1238B73C5d66e3719F7E63',
    geo: {
      type: 'Polygon',
      coordinates: [
        [
          [4.12309463691639, 50.9063282965795],
          [4.12354233585243, 50.9059615081557],
          [4.1240942015739, 50.9062255872186],
          [4.124672178717, 50.9065035614642],
          [4.12417124410914, 50.906858044948],
          [4.12364382397555, 50.9065995636625],
          [4.1233544162001, 50.9064566127623],
          [4.12316748427324, 50.9063642803043],
          [4.12309463691639, 50.9063282965795],
        ],
      ],
    },
  },
  {
    entity: 'Bpn_CaPa',
    recId: '3',
    capaKey: '23021B0001/00R000',
    type: 'PR',
    caSeKey: '23021B',
    fiscSitId: '1',
    updDate: '1558051200',
    shape_area: 21,
    owner: '0xe72b526B85074b8E7Ed9Da7036e87c997619cD7e',
    geo: {
      type: 'Polygon',
      coordinates: [
        [
          [4.12237287718604, 50.9058111822946],
          [4.12262174539113, 50.9056602590992],
          [4.12435519714272, 50.9051757798718],
          [4.1246988004503, 50.9053639136002],
          [4.12445796331056, 50.9055337365105],
          [4.12462145633197, 50.9056224234825],
          [4.12440969135012, 50.9057811318218],
          [4.12457311182103, 50.9058647675547],
          [4.12436607473543, 50.9060162671169],
          [4.12494127743342, 50.9063078990947],
          [4.12488933812342, 50.9063468954577],
          [4.12431055827543, 50.9060596255542],
          [4.1240942015739, 50.9062255872186],
          [4.12354233585243, 50.9059615081557],
          [4.12309463691639, 50.9063282965795],
          [4.12306949546006, 50.9063156319896],
          [4.12305698718048, 50.9063093213974],
          [4.12276079324542, 50.9061602879042],
          [4.12252177726462, 50.9060336319034],
          [4.12251808713561, 50.9060299645992],
          [4.12249174814441, 50.905990536813],
          [4.12237287718604, 50.9058111822946],
        ],
      ],
    },
  },
  {
    entity: 'Bpn_CaPa',
    recId: '4',
    capaKey: '23021A0004/00A000',
    type: 'PR',
    caSeKey: '23021A',
    fiscSitId: '1',
    updDate: '1558051200',
    shape_area: 33,
    owner: '0x2F91509cF55A2BcA0B4296140b2E6F7d6142Ef0C',
    geo: {
      type: 'Polygon',
      coordinates: [
        [
          [4.12933285607266, 50.921025501809],
          [4.12985571142816, 50.9209412093019],
          [4.12986154749349, 50.9209850352992],
          [4.12940291363, 50.9210757499934],
          [4.12935022523975, 50.9210582224382],
          [4.12933285607266, 50.921025501809],
        ],
      ],
    },
  },
  {
    entity: 'Bpn_CaPa',
    recId: '5',
    capaKey: '41302C0001/00_000',
    type: 'PR',
    caSeKey: '41302C',
    fiscSitId: '1',
    updDate: '1558051200',
    shape_area: 132,
    owner: '0x3670cc4D49381DF44D4B8e86951013aEdE53652f',
    geo: {
      type: 'Polygon',
      coordinates: [
        [
          [4.00765248709105, 50.956084565598],
          [4.00757663732021, 50.9561867403409],
          [4.00750809634001, 50.9561714730102],
          [4.00749111181867, 50.9561647139772],
          [4.00729513374556, 50.9560916497153],
          [4.00721557224313, 50.9560790272102],
          [4.00715394412534, 50.9560678539562],
          [4.00710388149193, 50.9560596359174],
          [4.00685706644467, 50.9560346883997],
          [4.00664031495804, 50.9559408918401],
          [4.0067670160424, 50.9557371696209],
          [4.00690527893727, 50.9555143534846],
          [4.00778125022555, 50.9558694231932],
          [4.00781098763832, 50.9558814800255],
          [4.00774301711345, 50.9559626161323],
          [4.00765248709105, 50.956084565598],
        ],
      ],
    },
  },
  {
    entity: 'Bpn_CaPa',
    recId: '6',
    capaKey: '41002A0002/00G002',
    type: 'PR',
    caSeKey: '41002A',
    fiscSitId: '1',
    updDate: '1558051200',
    shape_area: 33,
    owner: '0x98c8D9c9b950dF92eCC508A773223f193B9DE9af',
    geo: {
      type: 'Polygon',
      coordinates: [
        [
          [4.03296858190878, 50.9388688999617],
          [4.03286470042689, 50.9389493721898],
          [4.03284480731198, 50.9389082070947],
          [4.0328444260942, 50.9389056080818],
          [4.03284836963668, 50.938889322519],
          [4.03285477779743, 50.9388628212853],
          [4.03277047896337, 50.938839155405],
          [4.03270469551144, 50.9388206923117],
          [4.03258868020803, 50.9387890062642],
          [4.03266036784644, 50.9387264912295],
          [4.03296858190878, 50.9388688999617],
        ],
      ],
    },
  },
  {
    entity: 'Bpn_CaPa',
    recId: '7',
    capaKey: '11372D0003/00M000',
    type: 'PR',
    caSeKey: '11372D',
    fiscSitId: '1',
    updDate: '1558051200',
    shape_area: 23,
    owner: '0xc3d1161De1DC8E79D9454Bb034B11C8610FbBd00',
    geo: {
      type: 'Polygon',
      coordinates: [
        [
          [4.37106300497528, 51.122587692972],
          [4.37106026295305, 51.1225931482943],
          [4.37087369752822, 51.1228804511484],
          [4.37098076799874, 51.1229076205612],
          [4.37086172436915, 51.1232733293582],
          [4.3708558966738, 51.1232720809626],
          [4.3706017347054, 51.1232087431781],
          [4.37046062754305, 51.1231735193261],
          [4.37042828962369, 51.123165475072],
          [4.37007935789288, 51.1230785776799],
          [4.36992849730865, 51.1230761720579],
          [4.36969489340057, 51.1230725979697],
          [4.36935724980005, 51.1230689167234],
          [4.36935868587998, 51.1227769991306],
          [4.3693771822374, 51.1227614484478],
          [4.36988763291527, 51.1227113386353],
          [4.37025825280655, 51.1223842059602],
          [4.37106300497528, 51.122587692972],
        ],
      ],
    },
  },
  {
    entity: 'Bpn_CaPa',
    recId: '8',
    capaKey: '11372D0003/00L000',
    type: 'PR',
    caSeKey: '11372D',
    fiscSitId: '1',
    updDate: '1558051200',
    shape_area: 94,
    owner: '0x7AcaF2a407D445F92a68899697584b730ace0Dfe',
    geo: {
      type: 'Polygon',
      coordinates: [
        [
          [4.3707440473139, 51.1235902382227],
          [4.37061088960498, 51.1239874443452],
          [4.36934635320462, 51.1236560597494],
          [4.36934893375805, 51.1234802215796],
          [4.3696841950295, 51.1234849464715],
          [4.36969002929605, 51.1232619633229],
          [4.36969489340057, 51.1230725979697],
          [4.36992849730865, 51.1230761720579],
          [4.37007935789288, 51.1230785776799],
          [4.37042828962369, 51.123165475072],
          [4.37046062754305, 51.1231735193261],
          [4.3706017347054, 51.1232087431781],
          [4.3708558966738, 51.1232720809626],
          [4.3707440473139, 51.1235902382227],
        ],
      ],
    },
  },
  {
    entity: 'Bpn_CaPa',
    recId: '9',
    capaKey: '24662E0001/00R002',
    type: 'PR',
    caSeKey: '24662E',
    fiscSitId: '1',
    updDate: '1558051200',
    shape_area: 49,
    owner: '0xC6e978109795B79439877F1aEa2258BB9B1760b4',
    geo: {
      type: 'Polygon',
      coordinates: [
        [
          [4.81583514127613, 50.9759377883652],
          [4.81555104626693, 50.9762582783866],
          [4.81547138805749, 50.9761830432124],
          [4.81582623606053, 50.9757763101001],
          [4.81685001356622, 50.9760766708424],
          [4.81707254658318, 50.9761697959593],
          [4.81706344036544, 50.9761779211184],
          [4.81680392449927, 50.9761631442499],
          [4.81603456590236, 50.9759167310688],
          [4.81583514127613, 50.9759377883652],
        ],
      ],
    },
  },
  {
    entity: 'Bpn_CaPa',
    recId: '10',
    capaKey: '44502D0004/00A000',
    type: 'PR',
    caSeKey: '44502D',
    fiscSitId: '1',
    updDate: '1558051200',
    shape_area: 19,
    owner: '0x146113A4884570d57099f08FF83603b34e829F0e',
    geo: {
      type: 'Polygon',
      coordinates: [
        [
          [3.42505714080054, 51.0740667511531],
          [3.42519671564432, 51.0740459872017],
          [3.42549167012806, 51.0740535875104],
          [3.42552403454518, 51.0741455860965],
          [3.42541187927715, 51.0741566811975],
          [3.42511629392502, 51.0741860759342],
          [3.42510916431496, 51.0741716634005],
          [3.42505714080054, 51.0740667511531],
        ],
      ],
    },
  },
];

const migrate: DeployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  if (enabledFeatures.includes('PLOTS')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const uiDefinitions = require('../contracts/plot/UIDefinitions.json');

    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    await deployStateMachineSystem(
      [deployer],
      dGateKeeper,
      'PlotRegistry',
      'PlotFactory',
      ['AdminRoleRegistry', 'UserRoleRegistry'],
      uiDefinitions,
      storeIpfsHash
    );

    const artifact = await deployments.getArtifact('Plot');
    await deployments.save('Plot', {
      ...artifact,
      ...(await deployments.getExtendedArtifact('Plot')),
      address: '',
    });

    for (const plot of DUMMY_DATA) {
      await createPlot(plot, deployer);
    }
  }
  return true;
};

export default migrate;
migrate.id = '09_deploy_plot';
migrate.tags = ['Plot'];

async function createPlot(plot: IPlot, deployer: string) {
  const ipfsHash = await storeIpfsHash({
    entitity: plot.entity,
    recId: plot.recId,
    type: plot.type,
    caSeKey: plot.caSeKey,
    fiscSitId: plot.fiscSitId,
    updDate: plot.updDate,
    shape_area: plot.shape_area,
    geo: plot.geo,
  });
  await deployments.execute(
    'PlotFactory',
    { from: deployer, log: true },
    'create',
    plot.recId,
    plot.capaKey,
    plot.owner,
    ipfsHash
  );
}
