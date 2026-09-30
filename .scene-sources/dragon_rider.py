import bpy, math, random
from mathutils import Vector
random.seed(29)
for previous in list(bpy.data.objects):
    bpy.data.objects.remove(previous,do_unlink=True)
scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=768
scene.render.resolution_y=576
scene.render.resolution_percentage=100
scene.render.image_settings.media_type='IMAGE'
scene.render.image_settings.file_format='PNG'
scene.render.fps=24
scene.frame_start=1
scene.frame_end=97
scene.world=bpy.data.worlds.new('Soft studio atmosphere')
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(0.12,0.16,0.2,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=0.5
scene.view_settings.view_transform='AgX'

# Original tiled scale albedo/normal maps are embedded in the portable model.
N=256
heights=[]
for y in range(N):
    for x in range(N):
        u=x/N*12; v=y/N*18
        row=math.floor(v); sx=(u+(row%2)*0.5)%1-.5; sy=v%1-.5
        d=math.sqrt((sx/.52)**2+(sy/.64)**2)
        ridge=max(0,1-d)
        heights.append(ridge**0.55*.8 + .025*math.sin(x*2.73+y*3.71))
def image(name,pixels):
    im=bpy.data.images.new(name,width=N,height=N)
    im.pixels.foreach_set(pixels)
    im.pack()
    return im
colorpixels=[]; normalpixels=[]
for y in range(N):
    for x in range(N):
        i=y*N+x; h=heights[i]
        n=math.sin(x*.13+y*.23)*.035
        colorpixels.extend((.105+h*.045+n,.24+h*.08+n,.20+h*.06+n,1))
        dx=(heights[y*N+(x+1)%N]-heights[y*N+(x-1)%N])*.8
        dy=(heights[((y+1)%N)*N+x]-heights[((y-1)%N)*N+x])*.8
        normal=Vector((-dx,-dy,1)).normalized()
        normalpixels.extend(((normal.x+1)/2,(normal.y+1)/2,(normal.z+1)/2,1))
albedo=image('Veyr original emerald scale albedo',colorpixels)
normalmap=image('Veyr original scale normals',normalpixels)
normalmap.colorspace_settings.name='Non-Color'
def mat(name,color,rough=.7,metal=0,emission=None):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
    if emission:
        p.inputs['Emission Color'].default_value=(*color,1)
        p.inputs['Emission Strength'].default_value=emission
    return m
materials=[
mat('Emerald weathered scales',(.2,.4,.31),.64,.08),
mat('Copper wing membrane',(.31,.16,.105),.83),
mat('Ancient ivory horns and claws',(.55,.48,.30),.66),
mat('Saddle dark aged leather',(.11,.066,.039),.86),
mat('Rider midnight teal wool',(.035,.09,.13),.92),
mat('Antique bronze trim',(.43,.29,.115),.44,.62),
mat('Rider warm skin',(.52,.30,.18),.82),
mat('Rider dark auburn hair',(.055,.025,.014),.9),
mat('Amber dragon eyes',(.9,.38,.055),.28,0,1.6),
mat('Belly worn bronze scales',(.34,.30,.16),.83)
]
nodes=materials[0].node_tree.nodes;links=materials[0].node_tree.links
p=nodes.get('Principled BSDF')
t=nodes.new('ShaderNodeTexImage');t.image=albedo
links.new(t.outputs['Color'],p.inputs['Base Color'])
tn=nodes.new('ShaderNodeTexImage');tn.image=normalmap
nm=nodes.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.48
links.new(tn.outputs['Color'],nm.inputs['Color']);links.new(nm.outputs['Normal'],p.inputs['Normal'])
materials[1].use_backface_culling=False
membrane=[]
for y in range(N):
    for x in range(N):
        u=x/N;v=y/N
        grain=math.sin(x*2.11+y*1.43)*.012
        veins=abs(math.sin(v*math.pi*9+math.sin(u*4)*.9))
        shade=.86+.14*veins+.06*math.sin(u*31+v*13)
        membrane.extend((.28*shade+grain,.14*shade+grain,.085*shade+grain,1))
wingmap=image('Veyr original copper membrane',membrane)
wt=materials[1].node_tree.nodes.new('ShaderNodeTexImage');wt.image=wingmap
materials[1].node_tree.links.new(wt.outputs['Color'],materials[1].node_tree.nodes.get('Principled BSDF').inputs['Base Color'])

# Build semantic pieces into one material-batched, skinned mesh.
verts=[];faces=[];uvs=[];weights=[];face_materials=[]
def add(points,triangles,uv,weight,material):
    offset=len(verts)
    verts.extend(points);uvs.extend(uv)
    weights.extend([weight(Vector(p)) if callable(weight) else weight for p in points])
    faces.extend([tuple(offset+i for i in f) for f in triangles])
    face_materials.extend([material]*len(triangles))
bodyweight={'Body':1}
def ellipsoid(center,scale,material,weight=bodyweight,sides=24,rings=14):
    pts=[];tex=[];fs=[]
    for j in range(rings+1):
        v=j/rings;angle=math.pi*v
        for i in range(sides+1):
            u=i/sides;a=2*math.pi*u
            pts.append((center[0]+scale[0]*math.sin(angle)*math.cos(a),center[1]+scale[1]*math.sin(angle)*math.sin(a),center[2]+scale[2]*math.cos(angle)))
            tex.append((u,v))
    for j in range(rings):
        for i in range(sides):
            a=j*(sides+1)+i;b=a+sides+1
            if j>0:fs.append((a,b,a+1))
            if j<rings-1:fs.append((a+1,b,b+1))
    add(pts,fs,tex,weight,material)
def tube(path,radii,material,weight=bodyweight,sides=14):
    pts=[];tex=[];fs=[]
    for j,raw in enumerate(path):
        p=Vector(raw)
        tangent=Vector(path[min(j+1,len(path)-1)])-Vector(path[max(0,j-1)])
        tangent.normalize();ref=Vector((1,0,0))
        if abs(tangent.dot(ref))>.85:ref=Vector((0,0,1))
        a=tangent.cross(ref).normalized();b=tangent.cross(a).normalized()
        rx,ry=radii[j] if isinstance(radii[j],tuple) else (radii[j],radii[j])
        for i in range(sides+1):
            angle=i/sides*math.tau
            q=p+a*(math.cos(angle)*rx)+b*(math.sin(angle)*ry)
            pts.append(tuple(q));tex.append((i/sides,j/(len(path)-1)))
    for j in range(len(path)-1):
        for i in range(sides):
            a=j*(sides+1)+i;b=a+sides+1
            fs.extend(((a,b,a+1),(a+1,b,b+1)))
    fs.extend([tuple(range(sides-1,-1,-1)),tuple((len(path)-1)*(sides+1)+i for i in range(sides))])
    add(pts,fs,tex,weight,material)
def curved(points,radii,material,weight=bodyweight,sides=12,steps=32):
    # Cubic interpolation through editable anatomical landmarks.
    out=[];rs=[]
    for i in range(steps+1):
        t=i/steps*(len(points)-1);k=min(len(points)-2,math.floor(t));u=t-k
        a=Vector(points[max(0,k-1)]);b=Vector(points[k]);c=Vector(points[k+1]);d=Vector(points[min(len(points)-1,k+2)])
        q=.5*((2*b)+(-a+c)*u+(2*a-5*b+4*c-d)*u*u+(-a+3*b-3*c+d)*u*u*u)
        out.append(tuple(q));rs.append(radii[k]*(1-u)+radii[k+1]*u)
    tube(out,rs,material,weight,sides)
def taper(a,b,ra,rb,material,weight=bodyweight):
    tube([a,b],[ra,rb],material,weight,12)
def tailweight(p):
    f=max(0,min(1,(p.y-2.4)/2))
    return {'Tail':f,'Body':1-f}
ellipsoid((0,0,.1),(1,2.1,.95),0,sides=36,rings=20)
ellipsoid((0,-1.15,.14),(1.04,1.15,.94),0)
# Sinuous neck and long tail retain a continuous organic silhouette.
curved([(0,-1.5,.5),(0,-2.4,1),(0,-3.35,1.9),(0,-4.25,2.4),(0,-4.95,2.3)],[.68,.53,.39,.34,.40],0,sides=24,steps=34)
curved([(0,1.5,.15),(0,2.8,-.1),(.35,4.2,-.3),(.7,5.5,-.15),(.65,7,.4),(0,8.1,.75)],[.71,.5,.3,.19,.10,.01],0,tailweight,sides=18,steps=40)
# Wide cheekbones, a narrow muzzle, lower jaw, brow ridges and backward horns.
ellipsoid((0,-5.0,2.35),(.58,.72,.43),0,sides=32,rings=18)
ellipsoid((0,-5.58,2.19),(.39,.58,.26),0)
ellipsoid((0,-5.50,1.99),(.32,.54,.12),9)
for s in [-1,1]:
    ellipsoid((s*.47,-5.13,2.48),(.13,.24,.17),0)
    ellipsoid((s*.51,-5.23,2.46),(.082,.115,.076),8,sides=16,rings=10)
    ellipsoid((s*.38,-5.87,2.26),(.07,.09,.055),3,sides=12,rings=8)
    curved([(s*.4,-4.60,2.58),(s*.63,-4.38,2.94),(s*.69,-3.91,3.17),(s*.58,-3.54,3.2)],[.16,.13,.08,.005],2,steps=18)
    curved([(s*.43,-4.7,2.37),(s*.86,-4.16,2.36),(s*.96,-3.93,2.3)],[.13,.07,.002],2,steps=12)
    # Teeth are recessed against the jaw line, never detached.
    for i in range(6):
        y=-5.8+i*.14
        taper((s*.28,y,2.10),(s*.25,y,1.96),.046,.005,2)
# Dorsal osteoderms, belly plating and jointed hind/fore limbs.
for i in range(14):
    y=-4.2+i*.65
    if -.9<y<.9:continue
    cx=0 if y<2.8 else min(.7,(y-2.8)*.25)
    surface=[p[2] for p in verts if abs(p[1]-y)<.18 and abs(p[0]-cx)<.24]
    z=max(surface) if surface else .2
    taper((cx,y,z-.05),(cx,y+.25,z+.30),.10,.006,2,tailweight if y>2.3 else bodyweight)
for i in range(10):
    y=-2+i*.38; z=-.6+abs(y)*.07
    ellipsoid((0,y,z),(.72,.26,.13),9,sides=16,rings=8)
for s in [-1,1]:
    for front in [True,False]:
        y=-1.3 if front else 1.2
        ellipsoid((s*.77,y,-.18),(.40,.63,.57),0)
        elbow=(s*1.08,y+.48,-.72);ankle=(s*.8,y+.9,-1.04)
        curved([(s*.8,y,-.12),elbow,ankle],[.30,.20,.11],0,steps=18)
        ellipsoid((s*.82,y+.89,-1.03),(.23,.35,.16),0,sides=16,rings=10)
        for j in range(3):
            taper((s*(.65+j*.14),y+.69,-1.08),(s*(.65+j*.14),y+.34,-1.13),.06,.004,2)

# Batlike webbing with curved scallops, finger bones and delayed wing-tip flex.
for side,label in [(1,'L'),(-1,'R')]:
    wrist=Vector((side*3.15,-1.28,.77))
    roots=[(side*.83,-1.35,.53),tuple(wrist),(side*7.4,-.37,.67)]
    def wingweight(p,label=label):
        f=max(0,min(1,(abs(p.x)-3.2)/3.0))
        return {'Wing_'+label:1-f,'WingTip_'+label:f}
    curved(roots,[.27,.15,.018],0,wingweight,steps=28)
    tips=[Vector((side*7.4,-.37,.67)),Vector((side*6.95,1.3,.15)),Vector((side*5.70,2.75,-.10)),Vector((side*3.6,3.5,-.22)),Vector((side*.85,1.25,.15))]
    for tip in tips[1:-1]:
        curved([tuple(wrist),tuple(wrist.lerp(tip,.55)+Vector((0,0,.08))),tuple(tip)],[.09,.045,.008],0,wingweight,steps=20)
    for k in range(len(tips)-1):
        a=tips[k];b=tips[k+1];pts=[];fs=[];uv=[]
        nu=22;nv=12
        for j in range(nv+1):
            v=j/nv
            edge=a.lerp(b,v)
            edge=wrist+(edge-wrist)*(1-.18*math.sin(v*math.pi))
            for i in range(nu+1):
                u=i/nu
                q=wrist.lerp(edge,u)
                q.z-=.14*math.sin(u*math.pi)*math.sin(v*math.pi)
                pts.append(tuple(q));uv.append((u,v))
        for j in range(nv):
            for i in range(nu):
                n=j*(nu+1)+i;m=n+nu+1
                fs.extend(((n,m,n+1),(n+1,m,m+1)))
        add(pts,fs,uv,wingweight,1)
    taper((side*3.1,-1.5,.82),(side*3.36,-1.8,1.02),.12,.006,2,wingweight)

# A fitted saddle grounds the original academy rider to the creature.
ellipsoid((0,-.63,1.00),(.56,.67,.13),3)
for s in [-1,1]:
    tube([(s*.55,-1.2,.9),(s*.72,-.6,.4),(s*.57,-.1,-.1)],[.055,.065,.045],3)
ellipsoid((0,-.9,1.44),(.26,.24,.31),4)
ellipsoid((0,-1.04,1.99),(.31,.24,.46),4,sides=24,rings=16)
ellipsoid((0,-1.15,2.63),(.21,.19,.26),6,sides=24,rings=16)
ellipsoid((0,-1.10,2.81),(.225,.195,.15),7,sides=24,rings=12)
# Original face and a close hood collar; no franchise markings or costume.
ellipsoid((0,-1.34,2.62),(.046,.058,.065),6,sides=14,rings=8)
for s in [-1,1]:
    ellipsoid((s*.075,-1.309,2.687),(.027,.022,.017),7,sides=10,rings=6)
ellipsoid((0,-.99,2.56),(.252,.145,.31),4,sides=20,rings=14)
# Hood collar, bronze fastening, boots, arms and reins.
for s in [-1,1]:
    curved([(s*.16,-.9,1.45),(s*.52,-.82,1.1),(s*.64,-.50,.58)],[.18,.18,.11],4,steps=16)
    ellipsoid((s*.66,-.63,.48),(.13,.26,.17),3,sides=16,rings=10)
    curved([(s*.28,-1.05,2.13),(s*.45,-1.42,1.86),(s*.27,-1.78,1.86)],[.14,.105,.075],4,steps=18)
    ellipsoid((s*.26,-1.80,1.86),(.085,.11,.08),6,sides=12,rings=8)
    curved([(s*.24,-1.83,1.84),(s*.37,-2.7,1.74),(s*.4,-4.55,2.20)],[.018,.018,.018],3,steps=20,sides=6)
ellipsoid((0,-1.29,2.22),(.10,.035,.065),5,sides=12,rings=8)
# A cloth cape is skinned to a separate wind bone, with a scalloped hem.
pts=[];fs=[];uv=[]
for j in range(15):
    v=j/14
    for i in range(17):
        u=i/16;x=(u-.5)*(.62+v*1.0)
        pts.append((x,-.88+v*2.25,2.25-v*.80+.075*math.sin(u*math.pi*6)*v))
        uv.append((u,v))
for j in range(14):
    for i in range(16):
        a=j*17+i;b=a+17
        fs.extend(((a,b,a+1),(a+1,b,b+1)))
add(pts,fs,uv,lambda p:{'Cape':max(0,min(1,(p.y+.75)/1.5)),'Body':1-max(0,min(1,(p.y+.75)/1.5))},4)

mesh=bpy.data.meshes.new('Veyr anatomical mesh with rider');mesh.from_pydata(verts,[],faces);mesh.update()
obj=bpy.data.objects.new('Veyr_Dragon_And_Academy_Rider',mesh);scene.collection.objects.link(obj)
for m in materials:mesh.materials.append(m)
for i,p in enumerate(mesh.polygons):p.material_index=face_materials[i];p.use_smooth=True
uvlayer=mesh.uv_layers.new(name='Original surface UV')
for poly in mesh.polygons:
    for li in poly.loop_indices:uvlayer.data[li].uv=uvs[mesh.loops[li].vertex_index]

armdata=bpy.data.armatures.new('Veyr flight rig');arm=bpy.data.objects.new('Veyr_Flight_Rig',armdata);scene.collection.objects.link(arm)
bpy.context.view_layer.objects.active=arm;arm.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
spec=[
('Body',(0,0,0),(0,-2,0),None),
('Tail',(0,2.3,0),(0,5,0),'Body'),
('Wing_L',(.83,-1.35,.53),(3.2,-1.28,.77),'Body'),
('Wing_R',(-.83,-1.35,.53),(-3.2,-1.28,.77),'Body'),
('WingTip_L',(3.2,-1.28,.77),(7.4,-.37,.67),'Wing_L'),
('WingTip_R',(-3.2,-1.28,.77),(-7.4,-.37,.67),'Wing_R'),
('Cape',(0,-.88,2.25),(0,1.3,1.45),'Body')]
for name,head,tail,parent in spec:
    b=armdata.edit_bones.new(name);b.head=head;b.tail=tail
    if parent:b.parent=armdata.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT')
for name,_,_,_ in spec:obj.vertex_groups.new(name=name)
for i,w in enumerate(weights):
    for name,value in w.items():
        if value>0:obj.vertex_groups[name].add([i],value,'REPLACE')
mod=obj.modifiers.new('Organic flight deformation','ARMATURE');mod.object=arm
obj.parent=arm
for name in arm.pose.bones.keys():
    arm.pose.bones[name].rotation_mode='AXIS_ANGLE'
def rotate(name,axis,angle,frame):
    pb=arm.pose.bones[name];local=pb.bone.matrix_local.to_3x3().inverted()@Vector(axis)
    pb.rotation_axis_angle=(angle,local.x,local.y,local.z)
    pb.keyframe_insert(data_path='rotation_axis_angle',frame=frame)
for frame in range(1,98,4):
    phase=(frame-1)/96*math.tau*2
    flap=math.sin(phase)
    for s,l in [(1,'L'),(-1,'R')]:
        rotate('Wing_'+l,(0,1,0),s*(-.12-.40*flap),frame)
        rotate('WingTip_'+l,(0,1,0),s*(-.04-.17*math.sin(phase-.45)),frame)
    rotate('Tail',(0,0,1),.09*math.sin(phase*.5),frame)
    rotate('Cape',(1,0,0),.055*math.sin(phase+.3),frame)
    arm.pose.bones['Body'].location=(0,0,.09*math.sin(phase))
    arm.pose.bones['Body'].keyframe_insert(data_path='location',frame=frame)
if arm.animation_data and arm.animation_data.action:
    arm.animation_data.action.name='Veyr_Flight_Loop'
# Presentation camera and motivated lights for inspecting the authored asset.
def aim(o,point):
    o.rotation_euler=(Vector(point)-o.location).to_track_quat('-Z','Y').to_euler()
camdata=bpy.data.cameras.new('Creature review camera');cam=bpy.data.objects.new('Creature_Review_Camera',camdata)
scene.collection.objects.link(cam);cam.location=(13,-18,9);aim(cam,(0,0,1));camdata.lens=42;scene.camera=cam
for name,loc,power,color,kind in [('Sun',(6,-10,10),2.7,(1,.84,.65),'SUN'),('Fill',(-7,-5,6),1700,(.5,.75,1),'POINT'),('Rim',(2,8,7),2400,(.7,.84,1),'POINT')]:
    data=bpy.data.lights.new(name,kind);data.energy=power;data.color=color
    if kind=='SUN':data.angle=.08
    else:data.shadow_soft_size=3
    light=bpy.data.objects.new(name,data);scene.collection.objects.link(light);light.location=loc;aim(light,(0,0,0))
scene.frame_set(13)
target=artifacts.file(name='Veyr-dragon-and-rider-review.png',media_type='image/png')
scene.render.filepath=str(target.path)
bpy.ops.render.render(write_still=True)
target.publish()
scene.frame_set(1)
result={'name':obj.name,'vertices':len(verts),'triangles':sum(len(f)-2 for f in faces),'materials':len(materials),'bones':len(spec),'animation':'Veyr_Flight_Loop','frames':[1,97],'fps':24,'original':True}
